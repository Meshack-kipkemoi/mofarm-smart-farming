// lib/whatsapp/conversation-state.ts
import { createSuperClient } from "@/lib/supabase/admin";

export interface ConversationState {
  user_phone: string;
  awaiting_confirmation: boolean;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  expires_at: string;
}

export async function setConversationState(state: ConversationState) {
  const supabase = await createSuperClient();
  await supabase.from("whatsapp_conversations").upsert(state);
}

export async function getConversationState(userId: string) {
  const supabase = await createSuperClient();
  const { data } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("user_phone", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data;
}

export async function clearConversationState(userId: string) {
  const supabase = await createSuperClient();
  await supabase
    .from("whatsapp_conversations")
    .delete()
    .eq("user_phone", userId);
}
