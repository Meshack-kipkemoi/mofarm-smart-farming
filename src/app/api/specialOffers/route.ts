import { NextResponse } from "next/server";
import { Product } from "@/types/product";
import { createSuperClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createSuperClient();

  // Fetches ONLY products that have a special offer — no full products table scan
  const { data: specialOffers, error } = await supabase.from("special_offers")
    .select(`
      discount_percentage,
      products (*)
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const discountedProducts: Product[] = specialOffers
    .filter((offer) => offer.products !== null)
    .map((offer) => {
      const product = Array.isArray(offer.products)
        ? offer.products[0]
        : (offer.products as Product);
      const discount = offer.discount_percentage ?? 0;

      const discountedPrice = parseFloat(
        (product.price * (1 - discount / 100)).toFixed(2),
      );

      return {
        ...product,
        price: discountedPrice, // only price is modified
      };
    });

  return NextResponse.json(discountedProducts);
}
