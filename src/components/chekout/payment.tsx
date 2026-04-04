// @/src/components/chekout/payment.tsx
"use client";

import { useCheckoutStore } from "@/stores/checkout-store";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Payment() {
  const {
    paymentStatus,
    setPaymentStatus,
    setStep,
    name,
    phone,
    address,
    resetCheckout,
  } = useCheckoutStore();

  const { clearCart, setIsCheckoutOpen } = useCart();

  const handlePayment = async () => {
    setPaymentStatus("pending");

    try {
      // Simulate M-Pesa API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Randomly succeed for demo (replace with actual API logic)
      const success = true;

      if (success) {
        setPaymentStatus("completed");
        setTimeout(() => {
          setStep("done");
          // Optional: Clear cart on success
          // clearCart();
        }, 1000);
      } else {
        setPaymentStatus("failed");
      }
    } catch (error) {
      setPaymentStatus("failed");
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      resetCheckout();
    }, 300);
  };

  // Access form data from store for payment processing
  const orderDetails = {
    customer: name,
    phone: phone,
    address: address,
  };

  return (
    <div className="space-y-6">
      {/* Order Summary from Store */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
        <h4 className="font-semibold text-slate-900">Order Details</h4>
        <div className="flex justify-between">
          <span className="text-slate-600">Customer:</span>
          <span className="font-medium">{orderDetails.customer || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Phone:</span>
          <span className="font-medium">{orderDetails.phone || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Delivery:</span>
          <span className="font-medium">{orderDetails.address || "N/A"}</span>
        </div>
      </div>

      {/* Payment Status Display */}
      {paymentStatus === "pending" && (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-slate-600">Processing M-Pesa payment...</p>
          <p className="text-sm text-slate-500">
            Check your phone {phone} for STK push
          </p>
        </div>
      )}

      {paymentStatus === "completed" && (
        <div className="text-center py-8 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <p className="text-green-600 font-medium">Payment successful!</p>
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="text-center py-8 space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-600 font-medium">Payment failed</p>
          <Button onClick={handlePayment} variant="outline" className="w-full">
            Retry Payment
          </Button>
        </div>
      )}

      {paymentStatus !== "pending" && paymentStatus !== "completed" && (
        <div className="space-y-3">
          <Button onClick={handlePayment} className="w-full" disabled={!phone}>
            Pay via M-Pesa
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setStep("review")}
          >
            Back to Review
          </Button>
        </div>
      )}
    </div>
  );
}
