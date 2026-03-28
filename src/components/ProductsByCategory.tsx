"use client";

import { useState } from "react";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";
import { ChevronDown, ChevronUp } from "lucide-react";

const INITIAL_COUNT = 4;

const ProductsByCategory = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Shop by Category
          </h2>
          <p className="text-muted-foreground mt-2">
            Fresh farm produce delivered to your doorstep
          </p>
        </div>

        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat);
          const isExpanded = expanded[cat];
          const visible = isExpanded
            ? catProducts
            : catProducts.slice(0, INITIAL_COUNT);

          return (
            <div key={cat} className="mb-12">
              <h3 className="font-heading text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                {cat}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {catProducts.length > INITIAL_COUNT && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary px-6 py-2 text-sm font-semibold text-primary hover:bg-accent transition-colors active:scale-95"
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        See More <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductsByCategory;
