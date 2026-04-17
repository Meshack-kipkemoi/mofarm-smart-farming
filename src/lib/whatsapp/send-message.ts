const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

export async function sendWhatsAppMessage(to: string, text: string) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error("❌ Missing WhatsApp config");
    throw new Error("WhatsApp credentials not configured");
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            body: text,
            preview_url: true, // Enable link previews
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ WhatsApp API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`WhatsApp send failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Message sent:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
    throw error;
  }
}
