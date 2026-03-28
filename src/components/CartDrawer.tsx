import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="relative w-full max-w-md bg-card shadow-xl flex flex-col h-full animate-fade-in">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-heading text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" /> Your Cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-primary font-semibold text-sm hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 rounded-lg border p-3"
              >
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    KSh {item.product.price}/{item.product.unit}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="rounded-full border p-1 hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="rounded-full border p-1 hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-destructive hover:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-primary">
                    KSh {item.product.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between font-heading font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">
                KSh {totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full rounded-lg bg-primary py-3 font-heading font-bold text-primary-foreground hover:opacity-90 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
