import { createSuperClient } from "@/lib/supabase/admin";

export interface Product {
  id: string;
  name: string;
  category?: string;
  price: string | number;
  stock_quantity: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  pricePerKg: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface PendingProduct {
  product: Product;
  message: string;
  quantity?: number;
}

export interface ConversationState {
  user_phone: string;
  awaiting_confirmation: boolean;
  cart_items: CartItem[];
  pending_product: PendingProduct | null;
  messages: ChatMessage[];
  expires_at: string;
}

const STATE_TTL_MINUTES = 30;

export function createDefaultState(userId: string): ConversationState {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + STATE_TTL_MINUTES);

  return {
    user_phone: userId,
    awaiting_confirmation: false,
    cart_items: [],
    pending_product: null,
    messages: [],
    expires_at: expiresAt.toISOString(),
  };
}

export async function setConversationState(
  state: ConversationState,
): Promise<void> {
  const supabase = await createSuperClient();
  const { error } = await supabase.from("whatsapp_conversations").upsert(
    {
      user_phone: state.user_phone,
      awaiting_confirmation: state.awaiting_confirmation,
      cart_items: state.cart_items,
      pending_product: state.pending_product,
      messages: state.messages.slice(-20), // Keep last 20 turns
      expires_at: state.expires_at,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_phone" },
  );

  if (error) {
    console.error("❌ Failed to save conversation state:", error);
    throw new Error("Failed to persist conversation state");
  }
}

export async function getConversationState(
  userId: string,
): Promise<ConversationState | null> {
  const supabase = await createSuperClient();
  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("user_phone", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("❌ Failed to fetch conversation state:", error);
    return null;
  }

  if (!data) return null;

  return {
    user_phone: data.user_phone,
    awaiting_confirmation: data.awaiting_confirmation ?? false,
    cart_items: Array.isArray(data.cart_items) ? data.cart_items : [],
    pending_product: data.pending_product ?? null,
    messages: Array.isArray(data.messages) ? data.messages : [],
    expires_at: data.expires_at,
  };
}

export async function clearConversationState(userId: string): Promise<void> {
  const supabase = await createSuperClient();
  const { error } = await supabase
    .from("whatsapp_conversations")
    .delete()
    .eq("user_phone", userId);

  if (error) {
    console.error("❌ Failed to clear conversation state:", error);
  }
}
