// @/api/checkout/pay/route.ts
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/schemas/checkout";
import { ZodError } from "zod";
import { formatPhoneNumber, sendStk } from "@/lib/payment";
import { createSuperClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createSuperClient();

    // parse() throws on validation failure
    const validatedData = checkoutSchema.parse(body);

    //Calculating the total price of the items in the cart
    // const { data: totalAmount, error: totalError } = await supabase.rpc(
    //   "calculate_order_total",
    //   {
    //     order_items: body.items,
    //   },
    // );

    const totalAmount = 1;

    // if (totalError) {
    //   console.log("Error calculating total amount:");
    //   console.log(totalError);
    //   return NextResponse.json(
    //     { message: "Failed to calculate total amount" },
    //     { status: 500 },
    //   );
    // }

    //creating the order in the database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        payment_status: "pending",
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        amount: totalAmount,
        order_status: "pending",
        items: body.items,
      })
      .select("*")
      .single();

    if (orderError) {
      console.log("Error creating order in database:");
      console.log(orderError);
      return NextResponse.json(
        { message: "Failed to create order" },
        { status: 500 },
      );
    }

    //Creating the transaction in the transaction table
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        order_id: order.id,
        status: "pending",
        amount: totalAmount,
        method: "M-Pesa",
      })
      .select("*")
      .single();

    if (transactionError) {
      console.log("Error creating transaction in database:");
      console.log(transactionError);
      return NextResponse.json(
        { message: "Failed to create transaction" },
        { status: 500 },
      );
    }

    //Calculate the price of all the items in the cart
    const mpesaData = await sendStk(
      totalAmount,
      formatPhoneNumber(validatedData.phone),
      transaction.id,
    );

    console.log(mpesaData);

    return NextResponse.json(
      {
        message: "STK Push initiated successfully",
        transactionId: transaction.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error processing checkout:");
    console.log(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
