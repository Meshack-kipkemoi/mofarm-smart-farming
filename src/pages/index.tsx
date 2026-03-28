import HeroCarousel from "@/components/HeroCarousel";
import PopularProducts from "@/components/PopularProducts";
import ProductsByCategory from "@/components/ProductsByCategory";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

const Home = () => {
  return (
    <>
      <HeroCarousel />
      <PopularProducts />
      <ProductsByCategory />
      <CTASection />
      <FAQSection />
      <ContactSection />
    </>
  );
};

export default Home;
