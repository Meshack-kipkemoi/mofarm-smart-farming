// @/api/checkout/pay/route.ts

import { NextResponse } from "next/server";
import { checkoutSchema } from "@/schemas/checkout";
import { ZodError } from "zod";
import { formatPhoneNumber, sendStk } from "@/lib/payment";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // parse() throws on validation failure
    const validatedData = checkoutSchema.parse(body);

    //Calculate the price of all the items in the cart

    const mpesaData = await sendStk(
      1,
      formatPhoneNumber(validatedData.phone),
      "test-payment",
    );

    console.log(mpesaData);

    return NextResponse.json(
      { message: "STK Push initiated successfully" },
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
