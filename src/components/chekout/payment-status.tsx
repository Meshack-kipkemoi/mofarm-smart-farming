// @/components/checkout/payment.tsx
"use client";

import { useEffect, useState } from "react";
import {
  useCheckoutStore,
  PaymentStatus as PaymentStatusType,
} from "@/stores/checkout-store";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";

const statusConfig: Record<
  PaymentStatusType,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconColor: string;
    textColor: string;
  }
> = {
  pending: {
    icon: <Loader className="size-12 animate-spin mx-auto" />,
    title: "Processing M-Pesa payment...",
    description: "Check your phone for STK push",
    iconColor: "text-primary",
    textColor: "text-muted-foreground",
  },
  completed: {
    icon: <CheckCircle2 className="size-12 mx-auto" />,
    title: "Payment successful!",
    description: "Your order has been confirmed",
    iconColor: "text-green-500",
    textColor: "text-green-600",
  },
  failed: {
    icon: <XCircle className="size-12 mx-auto" />,
    title: "Payment failed",
    description: "Please try again or use a different method",
    iconColor: "text-destructive",
    textColor: "text-destructive",
  },
};

export function PaymentStatus() {
  const {
    paymentStatus,
    setPaymentStatus,
    setStep,
    name,
    phone,
    email,
    address,
    transactionId, // Get this from your store
    payment_phone,
  } = useCheckoutStore(
    useShallow((state) => ({
      paymentStatus: state.paymentStatus,
      setPaymentStatus: state.setPaymentStatus,
      setStep: state.setStep,
      name: state.name,
      phone: state.phone,
      email: state.email,
      address: state.address,
      transactionId: state.transactionId,
      payment_phone: state.payment_phone,
    })),
  );

  const [isListening, setIsListening] = useState(false);

  const orderDetails = [
    { label: "Customer", value: name },
    { label: "Phone", value: phone },
    { label: "Email", value: email },
    { label: "Delivery", value: address },
  ];

  useEffect(() => {
    if (!transactionId) return;

    const supabase = createClient();

    // Initial fetch to get current status
    const fetchInitialStatus = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("status")
        .eq("id", transactionId)
        .single();

      if (error) {
        console.error("Error fetching initial status:", error);
        return;
      }

      if (data && data.status !== "pending") {
        setPaymentStatus(data.status as PaymentStatusType);
        if (data.status === "completed") {
          setTimeout(() => setStep("success"), 800);
        }
      }
    };

    fetchInitialStatus();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`transaction_${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);

          const newStatus = payload.new.status as PaymentStatusType;

          // Update UI based on new status
          setPaymentStatus(newStatus);

          if (newStatus === "completed") {
            toast.success("Payment completed successfully!");
            setTimeout(() => setStep("success"), 800);
          } else if (newStatus === "failed") {
            toast.error("Payment failed. Please try again.");
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        setIsListening(status === "SUBSCRIBED");
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, setPaymentStatus, setStep]);

  const currentStatus = statusConfig[paymentStatus];

  // Retry payment handler
  const handleRetry = async () => {
    // Reset to review step to re-initiate payment
    setStep("payment");
  };

  return (
    <ScrollArea className="h-0 flex-1">
      <div className="space-y-6 py-6 px-4">
        {/* Connection Status Indicator */}
        {isListening && paymentStatus === "pending" && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Waiting for payment confirmation...
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm border">
          <h4 className="font-semibold text-foreground">Order Details</h4>
          {orderDetails.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-medium text-foreground">
                {value || "N/A"}
              </span>
            </div>
          ))}
          <h4 className="font-semibold text-foreground mt-4">
            Payment Details
          </h4>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium text-foreground">
              {payment_phone || "N/A"}
            </span>
          </div>
        </div>

        <div className={`space-y-4 p-2 rounded-lg border bg-muted/50`}>
          {/* Status Display */}
          <div className="text-center py-8 space-y-3">
            <div className={currentStatus.iconColor}>{currentStatus.icon}</div>
            <div className="space-y-1">
              <p className={`font-medium ${currentStatus.textColor}`}>
                {currentStatus.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {paymentStatus === "pending"
                  ? `Check your phone ${phone} for STK push`
                  : currentStatus.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {paymentStatus === "failed" && (
              <Button onClick={handleRetry} className="flex-1">
                Retry Payment
              </Button>
            )}

            {(paymentStatus === "completed" || paymentStatus === "failed") && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("payment")}
              >
                Back to Payment
              </Button>
            )}
          </div>
        </div>
      </div>
      <ScrollBar />
    </ScrollArea>
  );
}
