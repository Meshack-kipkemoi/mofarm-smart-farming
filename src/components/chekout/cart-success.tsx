// @/components/checkout/cart-success.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import {
  CheckCircle,
  Package,
  Clock,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import { OrderSummary } from "./order-summary";
import { useCheckoutStore } from "@/stores/checkout-store";

export const CartSuccess = () => {
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const clearCart = useCartStore((state) => state.clearCart);
  const setStep = useCheckoutStore((state) => state.setStep);

  const handleClose = () => {
    clearCart(); // Clear cart on success
    setStep("cart"); // Reset to cart step for next order
    setIsCartOpen(false);
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
  };

  return (
    <ScrollArea className="h-0 flex-1">
      <div className="flex flex-col h-full bg-linear-to-b from-emerald-50/50 to-background">
        <div className="px-4">
          <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
            <div className="bg-emerald-500 w-fit rounded-full p-3 mx-auto">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Your payment has been received and your order is being processed.
            </p>
          </div>

          <OrderSummary />

          {/* What's Next */}
          <div className="space-y-3 my-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
              What's Next?
            </h3>
            <div className="space-y-2">
              {[
                {
                  icon: ShoppingBag,
                  text: "We're preparing your items for shipment",
                },
                {
                  icon: Clock,
                  text: "You'll receive an SMS confirmation shortly",
                },
                {
                  icon: Package,
                  text: "You'll receive tracking updates to the provided email address",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <step.icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-muted-foreground">{step.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              size={"xl"}
            >
              Close
            </Button>

            <Button onClick={handleContinueShopping} size={"xl"} asChild>
              <Link href="/">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <ScrollBar />
    </ScrollArea>
  );
};
