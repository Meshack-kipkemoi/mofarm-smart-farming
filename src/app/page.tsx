import HeroCarousel from "@/components/HeroCarousel";
import SpecialOffers from "@/components/SpecialOffers";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { Product } from "@/types/product";
import axios from "axios";
import ProductsByCategory from "@/components/ProductsByCategory";
import { createSuperClient } from "@/lib/supabase/admin";

export default async function Home() {
  const supabase = await createSuperClient();

  const { data: products } = await axios.get<Product[]>(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/products`,
  );
  const { data: specialOffers } = await supabase.rpc(
    "get_active_special_offers",
  );

  return (
    <>
      <HeroCarousel />
      <SpecialOffers offers={specialOffers} />
      <ProductsByCategory products={products} />
      <CTASection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
