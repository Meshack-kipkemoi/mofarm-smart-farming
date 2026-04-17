import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// 🔹 Helper: Send WhatsApp Message
async function sendWhatsAppMessage(to: string, text: string) {
  try {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) return;

    await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
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
      },
    );
  } catch (error) {
    console.error("❌ WhatsApp send failed:", error);
  }
}

// 🔹 Helper: Handle WhatsApp Order Confirmation
async function handleWhatsAppOrder(
  phone: string,
  pendingOrder: any,
  mpesaReceipt: string,
) {
  try {
    await sendWhatsAppMessage(
      phone,
      `🎉 *ORDER CONFIRMED!* 🎉\n\n` +
        `✅ Payment Received via M-Pesa\n` +
        `🧾 Receipt: ${mpesaReceipt}\n\n` +
        `📦 ${pendingOrder.quantity}kg ${pendingOrder.product_name}\n` +
        `💰 KES ${parseFloat(pendingOrder.total_price).toFixed(2)}\n\n` +
        `🚜 Your order is being prepared!\n` +
        `📞 We'll contact you for pickup/delivery details.`,
    );

    // Create order record
    await supabase.from("orders").insert({
      phone: phone,
      product_id: pendingOrder.product_id,
      quantity: pendingOrder.quantity,
      total_amount: pendingOrder.total_price,
      status: "paid",
      payment_method: "mpesa_stk",
      source: "whatsapp",
      mpesa_receipt: mpesaReceipt,
      mpesa_checkout_id: pendingOrder.checkout_request_id,
      created_at: new Date().toISOString(),
    });

    // Clear pending order
    await supabase
      .from("whatsapp_sessions")
      .update({
        pending_order: null,
        last_intent: "order_completed",
        awaiting_confirmation: false,
      })
      .eq("phone", phone);
  } catch (error) {
    console.error("❌ WhatsApp order handling failed:", error);
  }
}

// 🔹 Helper: Handle E-commerce Web Order (YOUR EXISTING LOGIC)
async function handleWebOrderByTransactionId(
  transactionId: string,
  mpesaReceipt: string,
) {
  try {
    // Update your existing transactions table
    const { error: txError } = await supabase
      .from("transactions")
      .update({
        status: "completed",
        mpesa_receipt: mpesaReceipt,
        completed_at: new Date().toISOString(),
      })
      .eq("id", transactionId);

    if (txError) {
      console.error("❌ Failed to update transaction:", txError);
      return false;
    }

    // Update the related order status
    const { data: tx } = await supabase
      .from("transactions")
      .select("order_id")
      .eq("id", transactionId)
      .maybeSingle();

    if (tx?.order_id) {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", tx.order_id);
    }

    console.log(`✅ Web transaction ${transactionId} confirmed`);
    return true;
  } catch (error) {
    console.error("❌ Web order handling failed:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ status: "invalid_payload" }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, Metadata } = stkCallback;
    const phone = Metadata?.PhoneNumber;
    const amount = Metadata?.Amount;
    const reference = Metadata?.AccountReference; // 👈 KEY FIELD

    console.log(
      `📥 Callback: ref=${reference}, phone=${phone}, result=${ResultCode}`,
    );

    // ─────────────────────────────────────────────────────────────
    // ✅ PAYMENT SUCCESSFUL
    // ─────────────────────────────────────────────────────────────
    if (ResultCode === 0) {
      // 🔹 Detect source: WA- prefix = WhatsApp, else = Web (existing)
      const isWhatsApp = reference?.startsWith("WA-");

      if (isWhatsApp && phone) {
        // ── 💬 WHATSAPP FLOW ─────────────────────────────
        const { data: session } = await supabase
          .from("whatsapp_sessions")
          .select("phone, pending_order")
          .eq("phone", phone)
          .maybeSingle();

        if (session?.pending_order) {
          await handleWhatsAppOrder(
            phone,
            {
              ...session.pending_order,
              checkout_request_id: CheckoutRequestID,
            },
            CheckoutRequestID,
          );
        } else {
          // Fallback: notify user even if session expired
          await sendWhatsAppMessage(
            phone,
            `✅ Payment of KES ${amount} received! Thank you for your MoFarm order. 🌱`,
          );
        }
      } else {
        // ── 🌐 WEB FLOW (YOUR EXISTING E-COMMERCE) ─────────────────────────
        // reference = transaction.id (e.g., "txn_abc123")
        if (reference) {
          await handleWebOrderByTransactionId(reference, CheckoutRequestID);
        }
        // Your website frontend handles user notifications via polling
      }
    }
    // ─────────────────────────────────────────────────────────────
    // ❌ PAYMENT FAILED / CANCELLED
    // ─────────────────────────────────────────────────────────────
    else {
      console.log(`❌ Payment failed: ${ResultDesc}`);

      if (phone && reference?.startsWith("WA-")) {
        // Only notify WhatsApp users (web users see errors via frontend polling)
        await sendWhatsAppMessage(
          phone,
          `⚠️ Payment not completed: ${ResultDesc}\n\nReply HELP for support.`,
        );

        // Clear pending WhatsApp order
        await supabase
          .from("whatsapp_sessions")
          .update({ pending_order: null, awaiting_confirmation: false })
          .eq("phone", phone);
      }
      // Web flow: Your existing error handling remains unchanged
    }

    // ✅ Always return 200 to Safaricom
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("🚨 Callback Error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
