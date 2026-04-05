import axios from "axios";
import type { MpesaKeys } from "@/types/payments";

export async function sendStk(
  amount: number,
  phone: string,
  identifier: string, // unique identifier for this transaction, can be order ID or similar
  businessName: string = "Mofarm Smart Farming",
) {
  //Fetching all the keys from the environment variables
  const mpesaKeys: MpesaKeys = {
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    passkey: process.env.MPESA_PASSKEY!,
    shortCode: process.env.MPESA_SHORTCODE!,
  };

  // 1. Fetch the accesss token
  const auth = Buffer.from(
    `${mpesaKeys.consumerKey}:${mpesaKeys.consumerSecret}`,
  ).toString("base64");

  const tokenRes = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  if (!tokenRes.data?.access_token) {
    throw new Error("Failed to get access token from Safaricom");
  }

  const access_token = tokenRes.data.access_token;

  // 2. Generate password
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    mpesaKeys.shortCode + mpesaKeys.passkey + timestamp,
  ).toString("base64");

  // Construct and encode the Callback URL
  const callbackUrlWithQuery = `${process.env.MPESA_CALLBACK_URL}?identifier=${identifier}`;

  // 3. Build STK push payload
  const stkPayload = {
    Password: password,
    BusinessShortCode: mpesaKeys.shortCode,
    Timestamp: timestamp,
    Amount: amount,
    PartyA: phone,
    PartyB: mpesaKeys.shortCode,
    TransactionType: "CustomerPayBillOnline",
    PhoneNumber: phone,
    CallBackURL: callbackUrlWithQuery,
    AccountReference: businessName,
    TransactionDesc: "Payment test",
  };

  // 4. Send STK push request
  const stkRes = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    stkPayload,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    },
  );

  return stkRes.data;
}

export const formatPhoneNumber = (phoneNumber: string): string => {
  const phone = phoneNumber.replace(/\D/g, "");

  if (phone.startsWith("254")) return phone;
  if (phone.startsWith("0")) return "254" + phone.slice(1);
  if (phone.length === 9 && phone.startsWith("7")) return "254" + phone;

  // If none match, throw or return empty to catch bad data early
  throw new Error(`Invalid phone number format: ${phoneNumber}`);
};
