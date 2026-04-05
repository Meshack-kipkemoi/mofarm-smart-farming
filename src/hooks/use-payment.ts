"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";
import { useShallow } from "zustand/shallow";

export const usePaymentHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Get all checkout data from store
  const setStep = useCheckoutStore((state) => state.setStep);
  const setTransactionId = useCheckoutStore((state) => state.setTransactionId);
  const setPaymentStatus = useCheckoutStore((state) => state.setPaymentStatus);

  const { name, email, phone, address, payment_phone, transactionId } =
    useCheckoutStore(
      useShallow((state) => ({
        name: state.name,
        email: state.email,
        phone: state.phone,
        address: state.address,
        payment_phone: state.payment_phone,
        transactionId: state.transactionId,
      })),
    );

  const items = useCartStore((state) => state.items);

  const handlePayment = async (overridePhone?: string) => {
    const paymentPhone = overridePhone || payment_phone;

    if (!paymentPhone) {
      toast.error("Payment phone number is missing");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("pending");

    toast.loading("Initiating M-Pesa payment...", {
      id: "checkout-payment",
    });

    try {
      const res = await axios.post("/api/checkout/pay", {
        name,
        email,
        phone,
        payment_phone: paymentPhone,
        address,
        items,
        transactionId,
      });

      setTransactionId(res.data.transactionId);
      toast.dismiss("checkout-payment");
      toast.success("STK Push sent! Check your phone.");
      setStep("processing"); // Go to processing step
    } catch (error) {
      toast.dismiss("checkout-payment");

      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.errors) {
          // Show backend validation errors as toasts
          Object.entries(data.errors).forEach(([field, messages]) => {
            const message = (messages as string[])[0];
            toast.error(
              `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`,
              { duration: 5000 },
            );
          });
        } else {
          toast.error(data.message || "Payment failed. Please try again.");
        }

        // Set status to failed so user can retry
        setPaymentStatus("failed");
      } else {
        toast.error("Network error. Please check your connection.");
        setPaymentStatus("failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return { handlePayment, isProcessing };
};
