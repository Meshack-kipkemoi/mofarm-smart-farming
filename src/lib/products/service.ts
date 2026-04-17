import { createSuperClient } from "@/lib/supabase/admin";

export async function fetchProductByQuery(query: string) {
  try {
    const supabase = await createSuperClient();

    // Primary: Case-insensitive partial match on product name
    let { data: product, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("stock_quantity", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fallback: Search in category if name not found
    if (!product) {
      ({ data: product } = await supabase
        .from("products")
        .select("*")
        .ilike("category", `%${query}%`)
        .order("stock_quantity", { ascending: false })
        .limit(1)
        .maybeSingle());
    }

    if (error) {
      console.error("Supabase product query error:", error);
      return null;
    }

    return product;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return null;
  }
}

export async function fetchAllProductsForContext() {
  try {
    const supabase = await createSuperClient();
    const { data, error } = await supabase
      .from("products")
      .select("name, category, price, stock_quantity, description")
      .limit(50); // Limit to avoid token overflow

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error fetching products for context:", error);
    return [];
  }
}
