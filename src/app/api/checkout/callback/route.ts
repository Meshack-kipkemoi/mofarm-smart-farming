// @/app/api/checkout/callback/route.ts
import { NextResponse } from "next/server";
import { createSuperClient } from "@/lib/supabase/admin";

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
      merchantRequestId: callback.MerchantRequestID,
    });

    const supabase = await createSuperClient();

    // Call the RPC function to handle all updates atomically
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

    if (rpcError) {
      console.error("RPC error:", rpcError);
      return NextResponse.json(
        { message: "Failed to process callback" },
        { status: 500 },
      );
    }

    // Check the result from our function
    if (!result.success) {
      console.error("Callback processing failed:", result.error);
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    console.log("Callback processed successfully:", result);

    return NextResponse.json(
      { message: "Callback processed", result },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error in callback handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
