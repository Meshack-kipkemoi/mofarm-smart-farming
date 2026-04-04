import { createClient } from "@supabase/supabase-js";

export async function createSuperClient() {
  // Create an admin client that doesn't need a logged-in user
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}
