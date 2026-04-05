// @/app/api/checkout/callback/route.ts
import { NextResponse } from "next/server";
import { createSuperClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import OrderConfirmationEmail from "@/components/emails/order-confirmation";

interface StkCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const identifier = url.searchParams.get("identifier");

    if (!identifier) {
      console.error("Missing identifier in callback URL");
      return NextResponse.json(
        { message: "Missing identifier" },
        { status: 400 },
      );
    }

    const body: StkCallback = await request.json();
    const callback = body.Body.stkCallback;

    console.log("M-Pesa callback received:", {
      identifier,
      resultCode: callback.ResultCode,
      resultDesc: callback.ResultDesc,
    });

    const supabase = await createSuperClient();

    // Process callback
    const { data: result, error: rpcError } = await supabase.rpc(
      "handle_mpesa_callback",
      {
        p_transaction_id: identifier,
        p_result_code: callback.ResultCode,
        p_result_desc: callback.ResultDesc,
        p_mpesa_request_id: callback.CheckoutRequestID,
        p_callback_metadata: callback.CallbackMetadata
          ? JSON.stringify(callback.CallbackMetadata)
          : null,
      },
    );

    if (rpcError || !result?.success) {
      console.error("Callback processing failed:", rpcError || result?.error);
      return NextResponse.json(
        { message: rpcError?.message || result?.error || "Processing failed" },
        { status: 500 },
      );
    }

    // 🎉 Send email ONLY on success (ResultCode: 0)
    if (callback.ResultCode === 0 && result.order_id) {
      try {
        // Single RPC call gets order + items
        const { data: rows, error: fetchError } = await supabase.rpc(
          "get_order_with_items",
          { p_order_id: result.order_id },
        );

        if (fetchError || !rows || rows.length === 0) {
          console.error("Failed to fetch order details:", fetchError);
        } else {
          // First row has order details (same in all rows)
          const order = rows[0];

          // Map rows to email items format
          const emailItems = rows.map((row: any) => ({
            product: {
              id: row.product_id,
              name: row.product_name,
              price: parseFloat(row.product_price),
              image:
                "https://res.cloudinary.com/meshack-kipkemoi/image/upload/v1774801077/hero-fruits_zs58oz.jpg",
            },
            quantity: row.quantity,
          }));

          // Render email
          const email = OrderConfirmationEmail({
            orderId: order.order_id,
            customerName: order.customer_name,
            email: order.email,
            phone: order.phone || "",
            address: order.address,
            items: emailItems,
            totalPrice: parseFloat(order.total_amount),
            orderDate: new Date(order.order_date).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });

          // Send email
          const { error: emailError } = await resend.emails.send({
            from: "MoFarm <orders@quickprimetech.com>",
            to: order.email,
            subject: `Order Confirmation #${order.order_id.slice(0, 8).toUpperCase()}`,
            react: email,
          });

          if (emailError) {
            console.error("Failed to send email:", emailError);
          } else {
            console.log("Confirmation email sent to:", order.email);
          }
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the callback if email fails
      }
    }

    return NextResponse.json(
      { message: "Callback processed", result },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
