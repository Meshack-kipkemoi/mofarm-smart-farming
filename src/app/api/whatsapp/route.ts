import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-message";
import { fetchProductByQuery } from "@/lib/products/service";
import { generateChatResponse } from "@/lib/groq/chat";
import {
  getConversationState,
  setConversationState,
  clearConversationState,
  createDefaultState,
  type ConversationState,
  type CartItem,
} from "@/lib/whatsapp/conversation-state";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const STORE_URL =
  process.env.NEXT_PUBLIC_STORE_URL ||
  "https://mofarm-smart-farming.vercel.app/";

interface PaymentItem {
  id: string;
  quantity: number;
}

function buildPaymentUrl(phone: string, items: PaymentItem[]): string {
  const baseUrl = STORE_URL.replace(/\/$/, "");
  const itemsParam = encodeURIComponent(JSON.stringify(items));
  return `${baseUrl}/pay?phone=${encodeURIComponent(phone)}&items=${itemsParam}`;
}

function formatPhoneNumber(whatsappId: string): string {
  return whatsappId.replace(/\D/g, "");
}

function parsePrice(price: string | number | undefined): number {
  if (typeof price === "number") return price;
  if (typeof price === "string") {
    const parsed = parseFloat(price);

    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function extractProductNameWithGroq(
  message: string,
): Promise<string | null> {
  try {
    const completion = await groq.chat.completions.create({
      model: "groq/compound",
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

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const result = content.trim().toLowerCase();
    return result && result !== "null" ? result : null;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Groq extraction error:", errorMessage);
    return null;
  }
}

function buildStateContext(state: ConversationState | null): string {
  if (!state || state.cart_items.length === 0) return "";

  const cartSummary = state.cart_items
    .map(
      (item) =>
        `${item.product.name}: ${item.quantity}kg @ KES ${item.pricePerKg.toFixed(2)}/kg`,
    )
    .join(", ");

  return `Current cart: ${cartSummary}. Total items: ${state.cart_items.length}.`;
}

function buildCartSummary(state: ConversationState): string {
  if (state.cart_items.length === 0) return "🛒 Your cart is empty.";

  const lines = state.cart_items
    .map(
      (item) =>
        `• ${item.product.name} - ${item.quantity}kg @ KES ${item.pricePerKg.toFixed(2)}/kg`,
    )
    .join("\n");

  const total = state.cart_items
    .reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)
    .toFixed(2);

  return `🛒 *Your Cart*\n\n${lines}\n\n*Total: KES ${total}*`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      body.object === "whatsapp_business_account" &&
      Array.isArray(body.entry)
    ) {
      for (const entry of body.entry as Array<Record<string, unknown>>) {
        const changes =
          (entry?.changes as Array<Record<string, unknown>>) ?? [];
        for (const change of changes) {
          const value = (change?.value as Record<string, unknown>) ?? {};
          const messages = value?.messages;

          if (Array.isArray(messages)) {
            for (const message of messages) {
              const msg = message as Record<string, unknown>;
              if (msg.type !== "text") continue;

              const from = typeof msg.from === "string" ? msg.from : "";
              const text =
                typeof (msg.text as Record<string, unknown>)?.body === "string"
                  ? ((msg.text as Record<string, unknown>).body as string)
                  : "";

              if (!from || !text) continue;

              console.log(`📨 Message from ${from}: ${text}`);
              await handleUserMessage(from, text);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Error processing WhatsApp webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleUserMessage(
  userId: string,
  message: string,
): Promise<void> {
  const lowerMessage = message.toLowerCase().trim();

  let state = await getConversationState(userId);
  if (!state) {
    state = createDefaultState(userId);
  }

  // Refresh expiry on every interaction
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 30);
  state.expires_at = expiry.toISOString();

  // 0️⃣ User replies with ONLY a quantity (e.g. "5" or "5kg") for a pending product
  if (state.pending_product && !state.awaiting_confirmation) {
    const qtyMatch = lowerMessage.match(
      /^(\d+)\s*(kg|kgs|kilogram|kilograms)?$/i,
    );
    if (qtyMatch) {
      const qty = Math.max(1, parseInt(qtyMatch[1], 10));
      const { product } = state.pending_product;
      const stockQuantity =
        typeof product.stock_quantity === "number" ? product.stock_quantity : 0;
      const pricePerKg = parsePrice(product.price);

      // Low stock: offer what's available
      if (stockQuantity < qty) {
        const offerQty = stockQuantity;
        state.pending_product.quantity = offerQty;
        state.awaiting_confirmation = true;

        const total = (pricePerKg * offerQty).toFixed(2);
        const response =
          `⚠️ Only ${offerQty}kg available.\n\n` +
          `🌾 *${product.name}* - ${offerQty}kg @ KES ${pricePerKg.toFixed(2)}/kg = KES ${total}\n\n` +
          `Add to cart? (yes/no)`;

        await pushMessagesAndSave(state, message, response);
        await sendWhatsAppMessage(userId, response);
        return;
      }

      // Stock OK: ask for confirmation before adding to cart
      state.pending_product.quantity = qty;
      state.awaiting_confirmation = true;

      const total = (pricePerKg * qty).toFixed(2);
      const response =
        `🌾 *${product.name}* - ${qty}kg @ KES ${pricePerKg.toFixed(2)}/kg = KES ${total}\n\n` +
        `Add to cart? (yes/no)`;

      await pushMessagesAndSave(state, message, response);
      await sendWhatsAppMessage(userId, response);
      return;
    }
  }

  // 1️⃣ Handle confirmation responses (yes/no) and cart commands while awaiting
  if (state.awaiting_confirmation) {
    await handleConfirmation(userId, lowerMessage, state, message);
    return;
  }

  // 2️⃣ Checkout commands
  if (["checkout", "done", "finish", "pay now"].includes(lowerMessage)) {
    if (state.cart_items.length === 0) {
      const response =
        "🛒 Your cart is empty. Add products first by telling me what you'd like to buy! 🌾";
      await pushMessagesAndSave(state, message, response);
      await sendWhatsAppMessage(userId, response);
      return;
    }

    await generateAndSendPaymentLink(userId, state);
    await clearConversationState(userId);
    return;
  }

  // 3️⃣ View cart
  if (["cart", "view cart", "my cart", "show cart"].includes(lowerMessage)) {
    const response = buildCartSummary(state);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // 4️⃣ Parse quantity from message
  const quantityMatch = lowerMessage.match(
    /(\d+)\s*(kg|kgs|kilogram|kilograms)?/i,
  );
  const quantity: number | null = quantityMatch
    ? Math.max(1, parseInt(quantityMatch[1], 10))
    : null;

  // 5️⃣ Extract product name
  let productName = lowerMessage
    .replace(/(\d+)\s*(kg|kgs|kilogram|kilograms)?/i, "")
    .replace(
      /^(how\s+much\s+for|price\s+of|tell\s+me\s+about|i\s+want|buy|order|get)\s+/i,
      "",
    )
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 6️⃣ Fallback: Groq extraction
  if (!productName || productName.length < 2) {
    const extracted = await extractProductNameWithGroq(message);
    if (extracted) productName = extracted;
  }

  // 7️⃣ Greetings / general queries
  if (
    !productName ||
    ["hello", "hi", "help", "thanks", "thank you", "bye"].includes(productName)
  ) {
    const additionalContext = buildStateContext(state);
    const response = await generateChatResponse(
      message,
      null,
      null,
      STORE_URL,
      state.messages,
      additionalContext,
    );

    await pushMessagesAndSave(state, message, response);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // 8️⃣ Fetch product
  const product = await fetchProductByQuery(productName);
  if (!product) {
    const additionalContext = buildStateContext(state);
    const response = await generateChatResponse(
      message,
      null,
      null,
      STORE_URL,
      state.messages,
      `User searched for: "${productName}". Suggest similar products or ask for clarification. ${additionalContext}`,
    );

    await pushMessagesAndSave(state, message, response);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // 9️⃣ Quantity not provided — ask for it
  if (quantity === null) {
    const pricePerKg = parsePrice(product.price);
    const response =
      `🌾 *${product.name}* - KES ${pricePerKg.toFixed(2)}/kg\n\n` +
      `How many kilograms would you like? (Reply with a number, e.g., "5kg")`;

    state.pending_product = { product, message: lowerMessage };
    state.awaiting_confirmation = false;

    await pushMessagesAndSave(state, message, response);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // 🔟 Quantity provided — check stock and ask for CONFIRMATION (do NOT add to cart yet)
  const pricePerKg = parsePrice(product.price);
  const stockQuantity =
    typeof product.stock_quantity === "number" ? product.stock_quantity : 0;

  if (stockQuantity < quantity) {
    const offerQty = stockQuantity;
    state.pending_product = {
      product,
      message: lowerMessage,
      quantity: offerQty,
    };
    state.awaiting_confirmation = true;

    const total = (pricePerKg * offerQty).toFixed(2);
    const response =
      `⚠️ *${product.name}* - Low Stock\n\n` +
      `Only ${offerQty}kg available.\n\n` +
      `Add ${offerQty}kg @ KES ${pricePerKg.toFixed(2)}/kg = KES ${total} to cart? (yes/no)`;

    await pushMessagesAndSave(state, message, response);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // Stock OK — ask for confirmation
  state.pending_product = { product, message: lowerMessage, quantity };
  state.awaiting_confirmation = true;

  const itemTotal = (pricePerKg * quantity).toFixed(2);
  const response =
    `🌾 *${product.name}* - ${quantity}kg @ KES ${pricePerKg.toFixed(2)}/kg = KES ${itemTotal}\n\n` +
    `Add to cart? (yes/no)`;

  await pushMessagesAndSave(state, message, response);
  await sendWhatsAppMessage(userId, response);
}

async function handleConfirmation(
  userId: string,
  message: string,
  state: ConversationState,
  originalMessage: string,
): Promise<void> {
  // YES — move pending product into confirmed cart
  if (message.includes("yes") || message === "y") {
    if (
      state.pending_product &&
      typeof state.pending_product.quantity === "number"
    ) {
      const { product, quantity } = state.pending_product;
      const pricePerKg = parsePrice(product.price);

      const newItem: CartItem = { product, quantity, pricePerKg };
      state.cart_items.push(newItem);

      state.pending_product = null;
      state.awaiting_confirmation = false;

      const cartTotal = state.cart_items
        .reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)
        .toFixed(2);

      const response =
        `✅ Added ${quantity}kg of ${product.name} to cart!\n\n` +
        `🛒 Cart total: KES ${cartTotal} (${state.cart_items.length} item(s))\n\n` +
        `• Add another product?\n` +
        `• Type *"cart"* to review\n` +
        `• Type *"checkout"* to pay 🚀`;

      await pushMessagesAndSave(state, originalMessage, response);
      await sendWhatsAppMessage(userId, response);
      return;
    }

    // Fallback: pending product without resolved quantity
    state.pending_product = null;
    state.awaiting_confirmation = false;
    const response = `🤔 Something went wrong. Let's start over — tell me what you'd like to buy.`;
    await pushMessagesAndSave(state, originalMessage, response);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // NO — cancel only the pending item, keep confirmed cart intact
  // NO — cancel only the pending item, keep confirmed cart intact
  if (message.includes("no") || message === "n") {
    state.pending_product = null;
    state.awaiting_confirmation = false;

    const cartCount = state.cart_items.length;
    const response =
      cartCount > 0
        ? `👍 Cancelled. Your cart still has ${cartCount} confirmed item(s).\n\n` +
          `${buildCartSummary(state)}\n\n` +
          `Type *"checkout"* to pay or tell me another product.`
        : `👍 Cancelled. Your cart is empty.\n\nTell me what you'd like to buy! 🌾`;

    await pushMessagesAndSave(state, originalMessage, response);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // CHECKOUT — proceed with confirmed cart only (ignore pending item)
  if (message.includes("checkout")) {
    state.pending_product = null;
    state.awaiting_confirmation = false;

    if (state.cart_items.length === 0) {
      const response = `🛒 Your cart is empty. Add some items first!`;
      await pushMessagesAndSave(state, originalMessage, response);
      await sendWhatsAppMessage(userId, response);
      return;
    }

    await generateAndSendPaymentLink(userId, state);
    await clearConversationState(userId);
    return;
  }

  // CART — show confirmed cart
  if (["cart", "view cart", "my cart", "show cart"].includes(message)) {
    const response = buildCartSummary(state);
    await sendWhatsAppMessage(userId, response);
    return;
  }

  // Invalid response
  const invalidResponse =
    `🤔 Please reply with:\n` +
    `• *"yes"* to add to cart\n` +
    `• *"no"* to cancel\n` +
    `• *"cart"* to view your cart\n` +
    `• *"checkout"* to pay (confirmed items only)`;

  await pushMessagesAndSave(state, originalMessage, invalidResponse);
  await sendWhatsAppMessage(userId, invalidResponse);
}

async function generateAndSendPaymentLink(
  userId: string,
  state: ConversationState,
): Promise<void> {
  const phone = formatPhoneNumber(userId);

  const paymentItems: PaymentItem[] = state.cart_items.map((item) => ({
    id: item.product.id,
    quantity: item.quantity,
  }));

  const paymentUrl = buildPaymentUrl(phone, paymentItems);

  const grandTotal = state.cart_items
    .reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)
    .toFixed(2);

  const orderLines = state.cart_items
    .map(
      (item) =>
        `• ${item.product.name} - ${item.quantity}kg @ KES ${item.pricePerKg.toFixed(2)}/kg`,
    )
    .join("\n");

  const response =
    `🎉 *Ready to Checkout!*\n\n` +
    `📦 *Order Summary:*\n` +
    `${orderLines}\n\n` +
    `💵 *Total: KES ${grandTotal}*\n\n` +
    `🔗 *Complete your secure payment here:*\n${paymentUrl}\n\n` +
    `✅ Link expires in 30 minutes.\n\n` +
    `🌐 Our website: ${STORE_URL}`;

  await sendWhatsAppMessage(userId, response);
}

// Helper to push messages to history and persist state
async function pushMessagesAndSave(
  state: ConversationState,
  userContent: string,
  assistantContent: string,
): Promise<void> {
  state.messages.push({
    role: "user",
    content: userContent,
    timestamp: Date.now(),
  });
  state.messages.push({
    role: "assistant",
    content: assistantContent,
    timestamp: Date.now(),
  });
  await setConversationState(state);
}
