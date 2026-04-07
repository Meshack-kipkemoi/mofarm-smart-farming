import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Product } from "@/types/product";
import { ProductOffer } from "@/types/offer";
import { useCheckoutStore } from "./checkout-store";

export type CartItem = {
  productId: string;
  quantity: number;
};

// Enriched cart item with full product data
export type EnrichedCartItem = CartItem & { product: Product };

interface CartState {
  // Cart items (minimal storage)
  items: CartItem[];
  discounted_products: ProductOffer[];

  // Products cache (fetched from API)
  products: Product[];

  // UI State
  isCartOpen: boolean;

  // Computed state (derived from items + products)
  cartItems: EnrichedCartItem[];
  totalPrice: number;
  totalItems: number;

  // Actions
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setProducts: (products: Product[]) => void;
  setDiscountedProducts: (products: ProductOffer[]) => void;
  setIsCartOpen: (open: boolean) => void;
  // Individual getters
  getProduct: (productId: string) => Product | undefined;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Helper to compute derived state
const computeDerivedState = (
  items: CartItem[],
  products: Product[],
  discountedProducts: ProductOffer[],
) => {
  // const discountedProducts = useCartStore.getState().discounted_products

  const cartItems = items
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((item): item is EnrichedCartItem => item.product !== undefined);

  const totalPrice = cartItems.reduce((sum, item) => {
    const offer = discountedProducts.find(
      // 👈 check for discount
      (d) => d.product_id === item.productId,
    );
    const unitPrice = offer ? offer.discounted_price : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return { cartItems, totalPrice, totalItems };
};

export const useCartStore = create<CartState>()(
  immer(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        discounted_products: [],
        products: [],
        isCartOpen: false,
        cartItems: [],
        totalPrice: 0,
        totalItems: 0,

        // Actions (all update derived state after mutation)
        addToCart: (productId) => {
          set((state) => {
            const existingItem = state.items.find(
              (item) => item.productId === productId,
            );
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              state.items.push({ productId, quantity: 1 });
            }
          });
          useCheckoutStore.getState().setStep("cart");
          // Recompute derived state
          const { items, products, discounted_products } = get();
          set(computeDerivedState(items, products, discounted_products));
        },

        removeFromCart: (productId) => {
          set((state) => {
            const index = state.items.findIndex(
              (item) => item.productId === productId,
            );
            if (index !== -1) state.items.splice(index, 1);
          });
          const { items, products, discounted_products } = get();
          set(computeDerivedState(items, products, discounted_products));
        },

        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
          }
          set((state) => {
            const item = state.items.find(
              (item) => item.productId === productId,
            );
            if (item) item.quantity = quantity;
          });
          const { items, products, discounted_products } = get();
          set(computeDerivedState(items, products, discounted_products));
        },

        clearCart: () => {
          set({ items: [], cartItems: [], totalPrice: 0, totalItems: 0 });
        },

        setProducts: (products) => {
          set({ products });
          const { items, discounted_products } = get();
          set(computeDerivedState(items, products, discounted_products));
        },

        setDiscountedProducts: (products) => {
          set({ discounted_products: products });
        },

        setIsCartOpen: (open) => set({ isCartOpen: open }),

        // Individual getters (for single-item lookups)
        getProduct: (productId) =>
          get().products.find((p) => p.id === productId),

        isInCart: (productId) =>
          get().items.some((item) => item.productId === productId),

        getItemQuantity: (productId) =>
          get().items.find((item) => item.productId === productId)?.quantity ||
          0,
      }),
      {
        name: "mofarm_cart",
        partialize: (state) => ({
          items: state.items,
          // Don't persist derived state - it will be recomputed on load
        }),
        onRehydrateStorage: () => (state) => {
          // Recompute derived state after persistence rehydrates
          if (state) {
            const { items, products, discounted_products } = state;
            return {
              ...state,
              ...computeDerivedState(items, products, discounted_products),
            };
          }
        },
      },
    ),
  ),
);
