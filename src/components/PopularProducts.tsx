import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import { Star } from "lucide-react";

const PopularProducts = () => {
  // This filtering happens on the server
  const popular = products.filter((p) => p.popular);

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1 text-secondary font-semibold text-sm mb-2">
            <Star className="h-4 w-4 fill-secondary" /> BEST SELLERS
          </span>
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Popular Products
          </h2>
          <p className="text-muted-foreground mt-2">
            Loved by restaurants, schools & bulk buyers in Nyeri
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
