// @/components/cart/cart-drawer.tsx
"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Image } from "./ui/image";
import { useCart } from "@/stores/cart-store";

const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    totalPrice,
    updateQuantity,
    removeFromCart,
    setIsCheckoutOpen,
  } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b space-y-0">
          <SheetTitle className="flex items-center gap-2 font-heading text-lg">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Items Area */}
        <ScrollArea className="flex-1 px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Your cart is empty</p>
              <Button
                variant="link"
                onClick={() => setIsCartOpen(false)}
                className="mt-4 font-bold"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
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
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-bold w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
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
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-extrabold text-primary">
                      KSh{" "}
                      {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col border-t bg-muted/30 px-6 py-6 gap-4">
            <div className="flex items-center justify-between w-full font-heading font-bold text-xl">
              <span className="text-muted-foreground">Total</span>
              <span className="text-primary text-xl">
                KSh {totalPrice.toLocaleString()}
              </span>
            </div>
            <Button size={"xl"} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight className="ml-2" />
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
              Secure Delivery to Nyeri & Surrounding Areas
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
