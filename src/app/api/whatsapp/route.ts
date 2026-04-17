import { NextRequest, NextResponse } from "next/server";
import { createSuperClient } from "@/lib/supabase/admin";
import Groq from "groq-sdk";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-message";
import { fetchProductByQuery } from "@/lib/products/service";
import { generateChatResponse } from "@/lib/groq/chat";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// WhatsApp config
const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const STORE_URL = "https://mofarm-smart-farming.vercel.app/";

// ⚠️ Production Note: Use Supabase/Redis for state instead of Map
// This in-memory store works for development/single-instance deployments
const conversationState = new Map<
  string,
  {
    awaitingConfirmation: boolean;
    product: any;
    quantity: number;
    totalPrice: number;
    timestamp: number;
  }
>();

// Cleanup old states every 10 minutes (simple TTL)
setInterval(() => {
  const now = Date.now();
  for (const [userId, state] of conversationState.entries()) {
    if (now - state.timestamp > 10 * 60 * 1000) {
      conversationState.delete(userId);
    }
  }
}, 60000);

// ✅ WhatsApp Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  console.log("❌ Verification failed:", { mode, token });
  return new NextResponse("Forbidden: Verification token mismatch", {
    status: 403,
  });
}

// ✅ Handle Incoming Messages (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === "whatsapp_business_account" && body.entry) {
      for (const entry of body.entry) {
        if (entry.changes?.[0]?.value?.messages) {
          for (const message of entry.changes[0].value.messages) {
            // Ignore non-text messages & status updates
            if (message.type !== "text") continue;

            const from = message.from;
            const text = message.text.body;

            console.log(`📨 Message from ${from}: ${text}`);
            await handleUserMessage(from, text);
          }
        }
      }
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error processing WhatsApp webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

// 🧠 Main Message Handler
async function handleUserMessage(userId: string, message: string) {
  const lowerMessage = message.toLowerCase().trim();

  // 1️⃣ Check for confirmation response (yes/no flow)
  const state = conversationState.get(userId);
  if (state?.awaitingConfirmation) {
    await handleConfirmation(userId, lowerMessage, state);
    return;
  }

  // 2️⃣ Parse quantity (e.g., "10 kg", "5kg", "how much for 3 kilograms")
  const quantityMatch = lowerMessage.match(/(\d+)\s*(kg|kilogram|kilograms)?/i);
  const quantity = quantityMatch ? Math.max(1, parseInt(quantityMatch[1])) : 1;

  // 3️⃣ Extract product name (remove quantity & common phrases)
  let productName = lowerMessage
    .replace(/(\d+)\s*(kg|kilogram|kilograms)?/i, "")
    .replace(
      /^(how\s+much\s+for|price\s+of|tell\s+me\s+about|i\s+want|buy|order|get)\s+/i,
      "",
    )
    .replace(/[^\w\s]/g, " ") // Remove special chars
    .replace(/\s+/g, " ")
    .trim();

  // 4️⃣ If no clear product name, use Groq to extract intent
  if (!productName || productName.length < 2) {
    const extracted = await extractProductNameWithGroq(message);
    if (extracted) productName = extracted;
  }

  // 5️⃣ Handle greetings/general queries with Groq
  if (
    !productName ||
    ["hello", "hi", "help", "thanks", "thank you"].includes(productName)
  ) {
    const response = await generateChatResponse(message, null, null, STORE_URL);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // 6️⃣ Fetch product from Supabase
  const product = await fetchProductByQuery(productName);

  if (!product) {
    const response = await generateChatResponse(
      message,
      null,
      null,
      STORE_URL,
      `User searched for: "${productName}". Suggest similar products or ask for clarification.`,
    );
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // 7️⃣ Calculate pricing
  const pricePerKg = parseFloat(product.price);
  const totalPrice = pricePerKg * quantity;

  // 8️⃣ Check stock availability
  if (product.stock_quantity < quantity) {
    await sendWhatsAppMessage(
      userId,
      `⚠️ *${product.name}* - Low Stock Alert\n\n` +
        `We only have *${product.stock_quantity}kg* available.\n` +
        `Requested: ${quantity}kg @ KES ${pricePerKg.toFixed(2)}/kg\n` +
        `Would you like to:\n` +
        `• Order ${product.stock_quantity}kg instead? (Reply "yes ${product.stock_quantity}kg")\n` +
        `• Browse alternatives: ${STORE_URL}`,
    );
    return;
  }

  // 9️⃣ Send confirmation prompt
  const confirmationMsg =
    `🛒 *Order Summary*\n\n` +
    `🌾 *${product.name}*\n` +
    `📦 Quantity: *${quantity}kg*\n` +
    `💰 Price per kg: KES ${pricePerKg.toFixed(2)}\n` +
    `💵 *Total: KES ${totalPrice.toFixed(2)}*\n\n` +
    `✅ Reply *"yes"* to confirm this order\n` +
    `❌ Reply *"no"* to browse our full store: ${STORE_URL}`;

  await sendWhatsAppMessage(userId, confirmationMsg);

  // 🔟 Store conversation state for confirmation handling
  conversationState.set(userId, {
    awaitingConfirmation: true,
    product,
    quantity,
    totalPrice,
    timestamp: Date.now(),
  });
}

// ✅ Handle Yes/No Confirmation
async function handleConfirmation(
  userId: string,
  message: string,
  state: { product: any; quantity: number; totalPrice: number },
) {
  if (message.includes("yes") || message === "y") {
    // Optional: Create pending order in Supabase here
    await sendWhatsAppMessage(
      userId,
      `🎉 *Order Confirmed!*\n\n` +
        `✅ ${state.quantity}kg of ${state.product.name}\n` +
        `💵 Total: KES ${state.totalPrice.toFixed(2)}\n\n` +
        `🔗 *Complete your purchase here:*\n${STORE_URL}\n\n` +
        `📦 Add to cart & checkout securely. We'll notify you when your order is ready!`,
    );
  } else if (message.includes("no") || message === "n") {
    await sendWhatsAppMessage(
      userId,
      `👍 No problem!\n\n` +
        `🛍️ Browse our full catalog, add items to cart, and checkout anytime:\n` +
        `${STORE_URL}\n\n` +
        `💬 Need help? Just ask me about any product!`,
    );
  } else {
    // Invalid response - re-prompt
    await sendWhatsAppMessage(
      userId,
      `🤔 Please reply with:\n` +
        `✅ *"yes"* to confirm ${state.quantity}kg of ${state.product.name} @ KES ${state.totalPrice.toFixed(2)}\n` +
        `❌ *"no"* to visit our store: ${STORE_URL}`,
    );
    return; // Don't clear state - let user retry
  }

  // Clear state after successful handling
  conversationState.delete(userId);
}

// 🤖 Extract product name using Groq (fallback)
async function extractProductNameWithGroq(
  message: string,
): Promise<string | null> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are a product name extractor for an agricultural e-commerce store. 
          Return ONLY the most likely product name from the user's message, or null if none found.
          Examples:
          - "how much for maize 10kg" → "maize"
          - "price of organic tomatoes" → "tomatoes"
          - "i want to buy beans" → "beans"
          - "hello" → null
          Respond with just the name or null, no explanations.`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 30,
      temperature: 0.1,
    });

    const result = completion.choices[0]?.message?.content
      ?.trim()
      .toLowerCase();
    return result && result !== "null" ? result : null;
  } catch (error) {
    console.error("❌ Groq extraction error:", error);
    return null;
  }
}
