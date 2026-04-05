import { z } from "zod";

// Shared phone validation for both forms
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(
    /^(0|\+?254)?[71]\d{8}$/,
    "Enter a valid number (07XX XXX XXX or 2547XX XXX XXX)",
  );

// Full checkout schema
export const checkoutSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: phoneSchema,
  address: z.string().min(1, "Delivery address is required"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const paymentSchema = z.object({
  payment_phone: phoneSchema,
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const combineCheckoutSchema = checkoutSchema.merge(paymentSchema);

export type CombinedCheckoutData = z.infer<typeof combineCheckoutSchema>;
