// @/stores/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (cartItemId: string) => void; // Now uses cart item id
  updateQuantity: (cartItemId: string, quantity: number) => void; // Now uses cart item id
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;

  // Getters (call these in components or use selectors)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Simple ID generator (works in all browsers, no crypto needed)
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isCheckoutOpen: false,

      addToCart: (product) => {
        set((state) => {
          // Check if product already exists in cart
          const existingItem = state.items.find(
            (item) => item.product.id === product.id,
          );

          if (existingItem) {
            // Increment quantity of existing line item
            return {
              items: state.items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }

          // Add new item with unique cart item ID
          return {
            items: [...state.items, { id: generateId(), product, quantity: 1 }],
          };
        });

        // Optional: Auto-open cart
        // set({ isCartOpen: true });
      },

      removeFromCart: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === cartItemId ? { ...item, quantity } : item,
            ),
          }));
        }
      },

      clearCart: () => set({ items: [] }),

      setIsCartOpen: (open) => set({ isCartOpen: open }),
      setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),
    }),
    {
      name: "mofarm_cart",
      // Only persist cart items, not UI state (drawer/modal open states)
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Optional: Drop-in replacement hook matching your old Context API
// Usage: const { items, totalItems, removeFromCart } = useCart();
export function useCart() {
  const store = useCartStore();

  return {
    items: store.items,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isCartOpen: store.isCartOpen,
    setIsCartOpen: store.setIsCartOpen,
    isCheckoutOpen: store.isCheckoutOpen,
    setIsCheckoutOpen: store.setIsCheckoutOpen,
    totalItems: store.getTotalItems(),
    totalPrice: store.getTotalPrice(),
  };
}
