import Groq from "groq-sdk";
import { fetchAllProductsForContext } from "@/lib/products/service";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateChatResponse(
  userMessage: string,
  product: any,
  quantity: number | null,
  storeUrl: string,
  additionalContext?: string,
): Promise<string> {
  try {
    // Build dynamic context
    let productContext = "";
    if (product) {
      productContext = `
        CURRENT PRODUCT CONTEXT:
        - Name: ${product.name}
        - Category: ${product.category || "N/A"}
        - Price: KES ${product.price}/kg
        - Available Stock: ${product.stock_quantity}kg
        - Description: ${product.description || "No description"}
      `.trim();
    } else {
      // Fetch limited product list for general queries
      const products = await fetchAllProductsForContext();
      if (products.length > 0) {
        const productList = products
          .slice(0, 15)
          .map((p: any) => `• ${p.name} (KES ${p.price}/kg)`)
          .join("\n");
        productContext = `AVAILABLE PRODUCTS (partial list):\n${productList}`;
      }
    }

    const systemPrompt = `
      You are MoFarm Bot 🌾, a friendly WhatsApp assistant for an agricultural e-commerce store.
      
      STORE INFO:
      - Website: ${storeUrl}
      - All prices are in Kenyan Shillings (KES) per kilogram
      - Users can order via WhatsApp or visit our website to add to cart & checkout
      
      ${productContext}
      
      ${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ""}
      
      RESPONSE GUIDELINES:
      1. Keep responses concise (under 300 characters when possible)
      2. Use emojis sparingly for clarity (🛒💰📦✅❌)
      3. For pricing: always show "KES X.XX/kg" and calculate totals
      4. If user wants to buy: guide them to ${storeUrl}
      5. If product unknown: suggest checking the website or ask for clarification
      6. Never make up prices or stock info - use provided data only
    `.trim();

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 400,
      temperature: 0.6,
      top_p: 0.9,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      `Thanks for your message! 🌾 Visit ${storeUrl} to browse our products and place orders.`
    );
  } catch (error) {
    console.error("❌ Groq API error:", error);
    return `I'm experiencing a small issue right now. Please visit ${storeUrl} to browse products and order. We're here to help! 💬`;
  }
}
