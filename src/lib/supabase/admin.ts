import { createClient } from "@supabase/supabase-js";

export async function createSuperClient() {
  console.log("Creating Supabase admin client...");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "Supabase Secret Key:",
    process.env.SUPABASE_SECRET_KEY || "Not set",
  );
  // Create an admin client that doesn't need a logged-in user
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}
