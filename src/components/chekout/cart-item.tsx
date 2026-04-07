import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Image } from "@ui/image";
import { Button } from "@ui/button";
import { EnrichedCartItem, useCartStore } from "@/stores/cart-store";

export const CartItem = ({ item }: { item: EnrichedCartItem }) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const discountedProducts = useCartStore((state) => state.discounted_products);

  console.log("discounted ------->", discountedProducts);
  return (
    <div
      key={item.productId}
      className="flex gap-4 rounded-xl border bg-muted/30"
    >
      <div className="relative min-h-20  aspect-square shrink-0 overflow-hidden rounded-lg bg-muted">
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

      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        <div className="flex justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground truncate">
              {item.product.name}
            </h4>
            <p className="text-xs text-muted-foreground">
              KSh {item.product.price.toLocaleString()} /kg
            </p>
          </div>
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
        </div>
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
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
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              aria-label={`Increase quantity of ${item.product.name}`}
              title={`Increase quantity of ${item.product.name}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-sm font-extrabold text-primary">
            KSh {(item.product.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
