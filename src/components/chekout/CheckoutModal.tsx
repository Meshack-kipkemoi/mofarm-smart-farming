// @/components/chekout/index.tsx
"use client";

import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Review } from "./review";
import { Payment } from "./payment";
import { useCheckoutStore } from "@/stores/checkout-store";

const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();

  // Get step from store instead of local state
  const { step, resetCheckout, name, phone, address } = useCheckoutStore();

  const handleClose = () => {
    setIsCheckoutOpen(false);
    // Reset after animation
    setTimeout(() => {
      resetCheckout();
    }, 300);
  };

  const handleOrderComplete = () => {
    // Access stored form data anywhere
    console.log("Order completed with:", { name, phone, address });

    clearCart();
    handleClose();

    // Redirect to WhatsApp or other logic
    const message = `Hello! I just placed an order. Name: ${name}, Address: ${address}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "review" && "Checkout"}
            {step === "payment" && "Pay via M-Pesa"}
            {step === "done" && "Order Confirmed!"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-120px)] px-4">
          <div className="py-4">
            {step === "review" && <Review />}

            {step === "payment" && <Payment />}

            {step === "done" && (
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold">Order Received!</h3>
                <p className="text-slate-600">
                  Redirecting to WhatsApp to finalize your delivery...
                </p>
                <Button onClick={handleOrderComplete} className="w-full mt-4">
                  Open WhatsApp
                </Button>
              </div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
