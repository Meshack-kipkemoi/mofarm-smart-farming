import { create} from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Product } from "@/types/product";

export type CartItem = {
  productId: string;
  quantity: number;
};

// Enriched cart item with full product data
export type EnrichedCartItem = CartItem & { product: Product };

interface CartState {
  // Cart items (minimal storage)
  items: CartItem[];

  // Products cache (fetched from API)
  products: Product[];

  // UI State
  isCartOpen: boolean;
  isLoading: boolean;
  error: string | null;

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
  fetchProducts: () => Promise<void>;
  setIsCartOpen: (open: boolean) => void;

  // Individual getters
  getProduct: (productId: string) => Product | undefined;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Helper to compute derived state
const computeDerivedState = (items: CartItem[], products: Product[]) => {
  const cartItems = items
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((item): item is EnrichedCartItem => item.product !== undefined);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return { cartItems, totalPrice, totalItems };
};

export const useCartStore = create<CartState>()(
  immer(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        products: [],
        isCartOpen: false,
        isLoading: false,
        error: null,
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
          // Recompute derived state
          const { items, products } = get();
          set(computeDerivedState(items, products));
        },

        removeFromCart: (productId) => {
          set((state) => {
            const index = state.items.findIndex(
              (item) => item.productId === productId,
            );
            if (index !== -1) state.items.splice(index, 1);
          });
          const { items, products } = get();
          set(computeDerivedState(items, products));
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
          const { items, products } = get();
          set(computeDerivedState(items, products));
        },

        clearCart: () => {
          set({ items: [], cartItems: [], totalPrice: 0, totalItems: 0 });
        },

        setProducts: (products) => {
          set({ products });
          const { items } = get();
          set(computeDerivedState(items, products));
        },

        fetchProducts: async () => {
          set({ isLoading: true, error: null });
          try {
            const { data } = await import("axios").then((axios) =>
              axios.default.get<Product[]>("/api/products"),
            );
            set({ products: data, isLoading: false });
            const { items } = get();
            set(computeDerivedState(items, data));
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : "Failed to fetch",
              isLoading: false,
            });
          }
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
            const { items, products } = state;
            return { ...state, ...computeDerivedState(items, products) };
          }
        },
      },
    ),
  ),
);
