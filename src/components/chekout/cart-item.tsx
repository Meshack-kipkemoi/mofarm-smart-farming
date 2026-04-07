import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Image } from "@ui/image";
import { Button } from "@ui/button";
import { EnrichedCartItem, useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/alert-dialog";
import { Badge } from "@ui/badge";

export const CartItem = ({ item }: { item: EnrichedCartItem }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const discountedProducts = useCartStore((state) => state.discounted_products);

  // Check if this product has an active discount
  const offer = discountedProducts.find((d) => d.product_id === item.productId);
  const unitPrice = offer ? offer.discounted_price : item.product.price;
  const totalPrice = unitPrice * item.quantity;

  const handleRemoval = (option: "cart" | "item") => {
    if (option === "item" && item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
      return;
    }
    setIsDialogOpen(() => true);
  };
  return (
    <>
      <div
        key={item.productId}
        className="flex gap-4 rounded-xl border bg-muted/30"
      >
        <div className="relative min-h-20  aspect-5/4 shrink-0 rounded-lg bg-muted">
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
          {offer && (
            <Badge className="absolute -top-3 -left-3">
              {offer.discount_percentage}% off
            </Badge>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
          <div className="flex justify-between">
            <div>
              <h4 className="font-bold text-sm text-foreground truncate">
                {item.product.name}
              </h4>
              <div className="flex gap-2">
                <p
                  className={cn(
                    `text-xs text-muted-foreground`,
                    offer && "line-through",
                  )}
                >
                  KSh {item.product.price.toLocaleString()} /kg
                </p>
                {offer && (
                  <p className="text-xs text-muted-foreground">
                    KSh {unitPrice.toLocaleString()} /kg
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={() => handleRemoval("cart")}
              aria-label={`Remove ${item.product.name} from cart`}
              title={`Remove ${item.product.name} from cart`}
            >
              <Trash2 />
            </Button>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => handleRemoval("item")}
                aria-label={`Decrease quantity of ${item.product.name}`}
                title={`Decrease quantity of ${item.product.name}`}
              >
                <Minus />
              </Button>
              <span className="text-sm font-bold w-6 text-center">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                aria-label={`Increase quantity of ${item.product.name}`}
                title={`Increase quantity of ${item.product.name}`}
              >
                <Plus />
              </Button>
            </div>
            <span className="text-sm font-extrabold text-primary">
              KSh {totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="p-0 pt-3 overflow-hidden">
          <AlertDialogHeader className="px-4">
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{item.product.name}</strong> from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-muted/50 rounded-sm p-3">
            <AlertDialogCancel variant={"outline"}>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeFromCart(item.productId)}
              variant={"destructive"}
            >
              Remove {item.product.name} <ArrowRight />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
