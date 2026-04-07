"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { SheetFooter } from "@ui/sheet";
import { useCheckoutStore } from "@/stores/checkout-store";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import { CartItem } from "./cart-item";

export const CartStep = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const setStep = useCheckoutStore((state) => state.setStep);

  return (
    <>
      <ScrollArea className="h-0 flex-1">
        <div className="space-y-4 p-4">
          {cartItems.map((item) => (
            <CartItem item={item} key={item.productId} />
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <SheetFooter className="flex-col border-t bg-muted/30 px-6 py-6 gap-4">
        <div className="flex items-center justify-between w-full font-heading font-bold text-xl">
          <span className="text-muted-foreground">Total</span>
          <span className="text-primary text-xl">
            KSh {totalPrice.toLocaleString()}
          </span>
        </div>
        <Button size="xl" className="w-full" onClick={() => setStep("review")}>
          Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </SheetFooter>
    </>
  );
};
