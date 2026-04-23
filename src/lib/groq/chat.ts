import Groq from "groq-sdk";
import { fetchAllProductsForContext } from "@/lib/products/service";
import type { ChatMessage } from "@/lib/whatsapp/conversation-state";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ProductContext {
  id: string;
  name: string;
  category?: string;
  price: string | number;
  stock_quantity: number;
  description?: string;
}

export async function generateChatResponse(
  userMessage: string,
  product: ProductContext | null,
  quantity: number | null,
  storeUrl: string,
  conversationHistory: ChatMessage[],
  additionalContext?: string,
): Promise<string> {
  try {
    let productContext = "";

    if (product) {
      const pricePerKg =
        typeof product.price === "string"
          ? parseFloat(product.price)
          : product.price;
      const totalPrice =
        quantity && quantity > 0 ? (pricePerKg * quantity).toFixed(2) : null;

      productContext = `
CURRENT PRODUCT CONTEXT:
- Name: ${product.name}
- Category: ${product.category || "N/A"}
- Price: KES ${pricePerKg.toFixed(2)}/kg
- Available Stock: ${product.stock_quantity}kg
- Description: ${product.description || "No description"}
${quantity && quantity > 0 ? `- Requested Quantity: ${quantity}kg` : ""}
${totalPrice ? `- Calculated Total: KES ${totalPrice}` : ""}
      `.trim();
    } else {
      const products = await fetchAllProductsForContext();
      if (products.length > 0) {
        const productList = products
          .map((p) => {
            const price =
              typeof p.price === "string"
                ? parseFloat(p.price).toFixed(2)
                : p.price.toFixed(2);
            return `• ${p.name} (KES ${price}/kg)`;
          })
          .join("\n");
        productContext = `AVAILABLE PRODUCTS (partial list):\n${productList}`;
      }
    }

    const systemPrompt = `
You are MoFarm Bot 🌾, a friendly WhatsApp assistant for an agricultural e-commerce store.


STORE INFO:
- Store URL: ${storeUrl}
- All prices are in Kenyan Shillings (KES) per kilogram
- Users order DIRECTLY in this WhatsApp chat — no need to visit a website
- To buy: users tell you the product and quantity, you help add it to their cart, and they get a secure payment link to checkout

${productContext}

${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}

RESPONSE GUIDELINES:
1. Keep responses concise (under 300 characters when possible)
2. Use emojis sparingly for clarity (🛒💰📦✅❌)
3. For pricing:
   - Always show "KES X.XX/kg" for unit price
   - If quantity is provided in context, ALSO show "Total: KES X.XX for Ykg"
   - Never calculate totals yourself - use the pre-calculated values in context
4. If user wants to buy: tell them to reply with the product name and quantity (e.g., "5kg maize") so you can add it to their cart
5. If product unknown: ask for clarification or suggest they tell you another product name
6. Never make up prices, stock info, or totals - use provided data only
7. If stock is low, mention it: "Only Xkg available"
8. Be aware of the conversation history and refer to previous messages when relevant
9. NEVER tell users to visit the website to place an order. They can order right here in WhatsApp.
10. Only mention the website briefly after a payment link has already been sent, or if the user explicitly asks about our online catalog.
    `.trim();

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [{ role: "system", content: systemPrompt }];

    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: "user", content: userMessage });

    const completion = await groq.chat.completions.create({
      model: "groq/compound",
      messages,
      max_tokens: 400,
      temperature: 0.6,
      top_p: 0.9,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      `Thanks for your message! 🌾 Tell me what you'd like to buy and I'll help you add it to your cart.`
    );
  } catch (error: unknown) {
    console.error("❌ Groq API error:", error);
    return `I'm experiencing a small issue right now. Tell me what product you'd like to buy and I'll help you add it to your cart. 💬`;
  }
}
