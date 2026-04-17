import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSuperClient } from "@/lib/supabase/admin"; // Your admin client

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

// 🔹 Environment Variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// 🔹 Helper: Fetch products from Supabase (using admin client for RLS bypass)
async function fetchProducts(): Promise<any[]> {
  const adminSupabase = await createSuperClient();
  const { data, error } = await adminSupabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error("Products fetch error:", error);
    return [];
  }
  return data || [];
}

// 🔹 Helper: Find product by name (fuzzy match)
async function findProductByName(query: string): Promise<any | null> {
  const products = await fetchProducts();
  const lowerQuery = query.toLowerCase().trim();

  // Exact match first
  let product = products.find(
    (p) =>
      p.name.toLowerCase() === lowerQuery ||
      p.name.toLowerCase().includes(lowerQuery),
  );

  // Fuzzy fallback
  if (!product) {
    product = products.find((p) =>
      lowerQuery.includes(p.name.toLowerCase().split(" ")[0]),
    );
  }

  return product || null;
}

// 🔹 Helper: Parse quantity from user message (e.g., "10 kg tomatoes" → 10)
function parseQuantity(text: string): number {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)?/i);
  if (match) {
    const qty = parseFloat(match[1]);
    return isNaN(qty) || qty <= 0 ? 1 : qty;
  }
  return 1; // Default to 1kg if not specified
}

// 🔹 Helper: Validate Kenyan phone number
function isValidKenyanPhone(phone: string): boolean {
  return /^2547\d{8}$/.test(phone);
}

function normalizePhone(phone: string): string {
  if (phone.startsWith("254")) return phone;
  if (phone.startsWith("0")) return `254${phone.slice(1)}`;
  return `254${phone}`;
}

// 🔹 Helper: Send WhatsApp Message
async function sendWhatsAppMessage(to: string, text: string) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  return await response.json();
}

// 🔹 Helper: Get Groq AI Response with product-aware system prompt
async function getGroqResponse(
  message: string,
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [],
  productsContext?: string,
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // Updated to valid Groq model
      messages: [
        {
          role: "system",
          content: `You are MoFarm Smart Farming's sales assistant. 
          
PRODUCTS WE SELL:
${productsContext || "Tomatoes, Onions, Kale, Spinach, Eggs, Milk (prices in KES per kg/unit)"}

INSTRUCTIONS:
- Keep responses concise, friendly, and professional
- When users ask about products, mention name, price/kg, and availability
- If user shows buying intent (buy, order, purchase, how much), guide them: "Would you like to order [product]? Reply YES or NO"
- For quantity questions, ask "How many kg would you like?" before confirming
- NEVER calculate prices yourself - wait for backend to provide total
- Always end purchase flows with clear yes/no confirmation prompt`,
        },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      max_tokens: 400,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    console.error("Groq API Error:", await res.text());
    return "Sorry, I'm having trouble connecting. Please try again.";
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Could you rephrase that?";
}

// 🔹 Helper: Get Daraja Token
async function getDarajaToken(): Promise<string> {
  const credentials = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString("base64");
  const baseUrl = IS_PRODUCTION
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const res = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) throw new Error(`Daraja token error: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// 🔹 Helper: Trigger STK Push with dynamic amount
async function triggerSTKPush(
  phone: string,
  amount: number,
  reference: string,
) {
  const normalizedPhone = normalizePhone(phone);
  if (!isValidKenyanPhone(normalizedPhone)) {
    throw new Error(`Invalid phone: ${phone}`);
  }

  const token = await getDarajaToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");
  const baseUrl = IS_PRODUCTION
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount), // M-Pesa requires integer
    PartyA: normalizedPhone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: normalizedPhone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: reference.slice(0, 12), // Max 12 chars
    TransactionDesc: "MoFarm Order",
  };

  const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (result.errorCode)
    throw new Error(result.errorMessage || "STK Push failed");
  return result;
}

// 🔹 Helper: Get user state from Supabase
async function getUserState(phone: string) {
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .select(
      "awaiting_confirmation, conversation_history, processed_message_ids, pending_order, last_intent",
    )
    .eq("phone", phone)
    .single();

  if (error || !data) {
    return {
      awaiting_confirmation: false,
      conversation_history: [],
      processed_message_ids: [],
      pending_order: null,
      last_intent: null,
    };
  }

  return {
    awaiting_confirmation: data.awaiting_confirmation ?? false,
    conversation_history: (data.conversation_history as any[]) ?? [],
    processed_message_ids: (data.processed_message_ids as string[]) ?? [],
    pending_order: data.pending_order,
    last_intent: data.last_intent,
  };
}

// 🔹 Helper: Update user state
async function updateUserState(phone: string, state: any) {
  await supabase.from("whatsapp_sessions").upsert(
    {
      phone,
      awaiting_confirmation: state.awaiting_confirmation,
      conversation_history: state.conversation_history ?? [],
      processed_message_ids: state.processed_message_ids ?? [],
      pending_order: state.pending_order ?? null,
      last_intent: state.last_intent ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone" },
  );
}

// 🔸 Webhook Verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// 🔸 Incoming Message Handler (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const messages = entry?.changes?.[0]?.value?.messages;

    if (!messages?.length) return NextResponse.json({ status: "no_messages" });

    const message = messages[0];
    const phone = message.from;
    const text = message.text?.body?.trim();
    const messageId: string = message.id;
    const userName =
      entry?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "Customer";

    if (!text) return NextResponse.json({ status: "no_text" });

    // Deduplication
    const state = await getUserState(phone);
    if (state.processed_message_ids.includes(messageId)) {
      return NextResponse.json({ status: "duplicate" });
    }
    const updatedMessageIds = [...state.processed_message_ids, messageId].slice(
      -50,
    );

    const lowerText = text.toLowerCase();

    // 🔹 Handle confirmation flow (YES/NO for purchase)
    if (state.awaiting_confirmation && state.pending_order) {
      if (lowerText === "yes" || lowerText === "y") {
        // Clear confirmation state but keep pending_order for callback reference
        await updateUserState(phone, {
          awaiting_confirmation: false,
          conversation_history: state.conversation_history,
          processed_message_ids: updatedMessageIds,
          pending_order: state.pending_order,
        });

        await sendWhatsAppMessage(
          phone,
          `🙏 Thank you, ${userName}! Sending M-Pesa prompt to ${normalizePhone(phone)}. Please enter your PIN to complete your order for ${state.pending_order.quantity}kg ${state.pending_order.product_name} at KES ${state.pending_order.total_price}.`,
        );

        try {
          // In your WhatsApp POST handler, when user says "yes" to buy:
          const stkResult = await triggerSTKPush(
            phone,
            state.pending_order.total_price,
            // 👇 Add WA- prefix for callback routing
            `WA-${state.pending_order.product_id}-${phone.slice(-8)}`,
          );
          console.log("✅ STK Push triggered:", stkResult);
        } catch (error: any) {
          console.error("❌ STK Push failed:", error);
          await sendWhatsAppMessage(
            phone,
            "⚠️ Payment initiation failed. Please try again or contact support.",
          );
          // Clear pending order on failure
          await updateUserState(phone, { pending_order: null });
        }
      } else if (lowerText === "no" || lowerText === "n") {
        await updateUserState(phone, {
          awaiting_confirmation: false,
          pending_order: null,
          conversation_history: state.conversation_history,
          processed_message_ids: updatedMessageIds,
        });
        await sendWhatsAppMessage(
          phone,
          `👍 No problem, ${userName}! Ask me anything else about our farm products.`,
        );
      } else {
        // Invalid response - re-prompt
        await updateUserState(phone, {
          awaiting_confirmation: true,
          processed_message_ids: updatedMessageIds,
        });
        await sendWhatsAppMessage(
          phone,
          '❓ Please reply *"YES"* to pay or *"NO"* to cancel.',
        );
      }
      return NextResponse.json({ status: "confirmation_handled" });
    }

    // 🔹 Fetch products for context-aware AI
    const products = await fetchProducts();
    const productsContext = products
      .map(
        (p: any) =>
          `- ${p.name}: KES ${p.price}/kg (Stock: ${p.stock_quantity})`,
      )
      .join("\n");

    // 🔹 Detect product inquiry intent
    const productKeywords = [
      "tomato",
      "onion",
      "kale",
      "spinach",
      "egg",
      "milk",
      "price",
      "buy",
      "order",
      "how much",
    ];
    const isProductQuery = productKeywords.some((kw) => lowerText.includes(kw));

    let aiResponse = "";
    let pendingOrder = null;

    if (isProductQuery) {
      // Try to extract product name and quantity
      const product = await findProductByName(text);

      if (product) {
        const quantity = parseQuantity(text);
        const totalPrice = parseFloat(product.price) * quantity;

        // Store pending order for confirmation flow
        pendingOrder = {
          product_id: product.id,
          product_name: product.name,
          price_per_kg: parseFloat(product.price),
          quantity: quantity,
          total_price: totalPrice,
          created_at: new Date().toISOString(),
        };

        aiResponse = `🍅 *${product.name}* - KES ${product.price}/kg\n\nYou selected: ${quantity}kg\n*Total: KES ${totalPrice.toFixed(2)}*\n\nWould you like to order this? Reply *YES* or *NO*.`;

        // Update state with pending order and set awaiting_confirmation
        await updateUserState(phone, {
          awaiting_confirmation: true,
          pending_order: pendingOrder,
          last_intent: "purchase_intent",
          conversation_history: [
            ...state.conversation_history.slice(-18),
            { role: "user", content: text },
            { role: "assistant", content: aiResponse },
          ],
          processed_message_ids: updatedMessageIds,
        });

        await sendWhatsAppMessage(phone, aiResponse);
        return NextResponse.json({ status: "product_offer_sent" });
      } else {
        // Product not found - let AI handle
        aiResponse = await getGroqResponse(
          text,
          state.conversation_history,
          productsContext,
        );
      }
    } else {
      // General conversation
      aiResponse = await getGroqResponse(
        text,
        state.conversation_history,
        productsContext,
      );
    }

    // For non-purchase flows, just update history
    const updatedHistory = [
      ...state.conversation_history.slice(-18),
      { role: "user", content: text },
      { role: "assistant", content: aiResponse },
    ];

    await updateUserState(phone, {
      awaiting_confirmation: false,
      conversation_history: updatedHistory,
      processed_message_ids: updatedMessageIds,
      pending_order: null, // Clear any stale pending orders
    });

    await sendWhatsAppMessage(phone, aiResponse);
    return NextResponse.json({ status: "ok", response: aiResponse });
  } catch (error) {
    console.error("🚨 WhatsApp Webhook Error:", error);
    // Always return 200 to prevent Meta retry loops
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
