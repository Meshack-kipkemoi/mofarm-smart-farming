"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useCartStore } from "@/stores/cart-store";
import { SheetFooter } from "@ui/sheet";
import { useCheckoutStore } from "@/stores/checkout-store";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import { useShallow } from "zustand/shallow";

export const CartStep = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } =
    useCartStore(
      useShallow((state) => ({
        cartItems: state.cartItems,
        updateQuantity: state.updateQuantity,
        removeFromCart: state.removeFromCart,
        totalPrice: state.totalPrice,
      })),
    );
  const setStep = useCheckoutStore((state) => state.setStep);

  return (
    <>
      <ScrollArea className="h-0 flex-1">
        <div className="space-y-4 p-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border bg-muted/30 p-3"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    KSh {item.product.price.toLocaleString()} /kg
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    aria-label={`Decrease quantity of ${item.product.name}`}
                    title={`Decrease quantity of ${item.product.name}`}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="text-sm font-bold w-6 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    aria-label={`Increase quantity of ${item.product.name}`}
                    title={`Increase quantity of ${item.product.name}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(item.productId)}
                  aria-label={`Remove ${item.product.name} from cart`}
                  title={`Remove ${item.product.name} from cart`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <span className="text-sm font-extrabold text-primary">
                  KSh {(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
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
