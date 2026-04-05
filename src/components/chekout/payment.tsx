// @/components/checkout/payment.tsx
"use client";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";
import { ArrowLeft, Phone, Shield } from "lucide-react";
import { OrderSummary } from "./order-summary";
import { toast } from "sonner";
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@ui/input-group";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentFormData, paymentSchema } from "@/schemas/checkout";
import { useShallow } from "zustand/shallow";

export const Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Primitive selectors only
  const setStep = useCheckoutStore((state) => state.setStep);
  const setPaymentPhone = useCheckoutStore((state) => state.setPaymentPhone);
  const transactionId = useCheckoutStore((state) => state.transactionId);
  const setTransactionId = useCheckoutStore((state) => state.setTransactionId);
  const cartItems = useCartStore((state) => state.cartItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const { name, email, phone, address, payment_phone } = useCheckoutStore(
    useShallow((state) => ({
      name: state.name,
      email: state.email,
      phone: state.phone,
      address: state.address,
      payment_phone: state.payment_phone,
    })),
  );

  const items = useCartStore((state) => state.items);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_phone: payment_phone || phone, // Default to contact phone, but user can change it for payment
    },
  });

  const handlePayment = async (data: PaymentFormData) => {
    setIsProcessing(true);
    setPaymentPhone(data.payment_phone); // Update store with payment phone

    toast.loading("Initiating M-Pesa payment...", {
      id: "checkout-payment",
    });

    try {
      // Send complete checkout data + items
      const res = await axios.post("/api/checkout/pay", {
        name,
        email,
        phone,
        payment_phone: data.payment_phone, // Use phone from payment form (can be different from contact phone)
        address,
        items,
        transactionId,
      });

      setTransactionId(res.data.transactionId);
      toast.dismiss("checkout-payment");
      toast.success("STK Push sent! Check your phone.");
      setStep("processing"); // Move to processing step instead of success, since we still need to confirm payment status
    } catch (error) {
      toast.dismiss("checkout-payment");

      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.errors) {
          // Show backend validation errors as toasts
          // This ensures user sees errors even if they're not on the field's step
          Object.entries(data.errors).forEach(([field, messages]) => {
            const message = (messages as string[])[0];
            toast.error(
              `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`,
              {
                duration: 5000,
              },
            );
          });

          // If specific field error on phone, also set form error
          if (data.errors.payment_phone) {
            form.setError("payment_phone", {
              message: data.errors.payment_phone[0],
            });
          }
        } else {
          toast.error(data.message || "Payment failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <ScrollArea className="h-0 flex-1">
      <div className="flex-1 pt-6">
        {/* Order Summary */}
        <div className="mb-6 px-4">
          <OrderSummary />
        </div>

        {/* Payment Form */}
        <form onSubmit={form.handleSubmit(handlePayment)}>
          <div className="space-y-6 px-4 pb-6">
            <div className="bg-linear-to-r rounded-lg from-emerald-500/10 to-green-500/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-500 dark:text-emerald-700 text-sm">
                    Secure M-Pesa Payment
                  </h3>
                  <p className="text-xs text-emerald-600">
                    Your transaction is encrypted and protected
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Number Field */}
            <Controller
              name="payment_phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="payment_phone">Phone Number</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Phone />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="payment_phone"
                      type="tel"
                      placeholder="Phone Number (e.g., +254701234567)"
                      aria-invalid={fieldState.invalid}
                      autoComplete="tel"
                    />
                  </InputGroup>
                  <FieldDescription>
                    This is the number that will be used for the M-Pesa
                    transaction. Make sure it's correct!
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Amount Display */}
            <div className="bg-muted/50 flex justify-between rounded-lg p-4 items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-emerald-600">
                KSh {totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border  rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Click "Pay with M-Pesa" below</li>
                <li>You'll receive an STK push on your phone</li>
                <li>Enter your M-Pesa PIN to confirm</li>
                <li>Payment completed instantly!</li>
              </ol>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 pt-3 sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4 rounded-t-lg">
            <Button
              type="button"
              size={"xl"}
              variant="outline"
              onClick={() => setStep("review")}
              disabled={isProcessing}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              size={"xl"}
              className="flex-3"
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <>
                  Pay with M-Pesa
                  <span className="ml-2">→</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      <ScrollBar />
    </ScrollArea>
  );
};
