// @/stores/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Product } from "@/types/product";

export type CartItem = {
  productId: string;
  quantity: number;
};

interface CartStore {
  // Cart items (minimal)
  items: CartItem[];

  // Products cache (fetched from API)
  products: Product[];

  // UI State
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Cart Actions
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Product Actions
  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;

  // UI Actions
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getProduct: (productId: string) => Product | undefined;
  getCartItemsWithProducts: () => Array<CartItem & { product: Product }>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartStore>()(
  immer(
    persist(
      (set, get) => ({
        items: [],
        products: [],
        isCartOpen: false,
        isCheckoutOpen: false,
        isLoading: false,
        error: null,

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
        },

        removeFromCart: (productId) => {
          set((state) => {
            const index = state.items.findIndex(
              (item) => item.productId === productId,
            );
            if (index !== -1) state.items.splice(index, 1);
          });
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
        },

        clearCart: () => set({ items: [] }),

        setProducts: (products) => set({ products }),

        fetchProducts: async () => {
          set({ isLoading: true, error: null });
          try {
            const { data } = await import("axios").then((axios) =>
              axios.default.get<Product[]>("/api/products"),
            );
            set({ products: data, isLoading: false });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to fetch",
              isLoading: false,
            });
          }
        },

        setIsCartOpen: (open) => set({ isCartOpen: open }),
        setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

        getTotalItems: () =>
          get().items.reduce((sum, item) => sum + item.quantity, 0),

        getTotalPrice: () => {
          const { items, products } = get();
          return items.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.productId);
            return sum + (product?.price || 0) * item.quantity;
          }, 0);
        },

        getProduct: (productId) =>
          get().products.find((p) => p.id === productId),

        getCartItemsWithProducts: () => {
          const { items, products } = get();
          return items
            .map((item) => ({
              ...item,
              product: products.find((p) => p.id === item.productId),
            }))
            .filter(
              (item): item is CartItem & { product: Product } =>
                item.product !== undefined,
            );
        },

        isInCart: (productId) =>
          get().items.some((item) => item.productId === productId),

        getItemQuantity: (productId) =>
          get().items.find((item) => item.productId === productId)?.quantity ||
          0,
      }),
      {
        name: "mofarm_cart",
        partialize: (state) => ({ items: state.items }), // Don't persist products, only cart
      },
    ),
  ),
);

// Convenience hook that returns enriched cart items
export function useCart() {
  const store = useCartStore();
  return {
    ...store,
    cartItems: store.getCartItemsWithProducts(), // Enriched with product data
    totalPrice: store.getTotalPrice(),
    totalItems: store.getTotalItems(),
  };
}
