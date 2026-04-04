"use client";

import { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ChevronDown, ChevronUp, Search, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

const INITIAL_COUNT = 4;

const ProductsByCategory = () => {
  const { products, isLoading, error, fetchProducts } = useCartStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Extract unique categories from stored products
  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    ).sort();
  }, [products]);

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth",
      });
    }
  };

  // Filter logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return { categories, products };

    const filteredCats = categories.filter((cat) => {
      const catMatches = cat.toLowerCase().includes(query);
      const hasMatchingProducts = products.some(
        (p) =>
          p.category === cat &&
          (p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)),
      );
      return catMatches || hasMatchingProducts;
    });

    const filteredProds = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );

    return { categories: filteredCats, products: filteredProds };
  }, [searchQuery, categories, products]);

  if (isLoading) {
    return (
      <section id="products" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground">Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchProducts()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Shop by Category
          </h2>
        </div>

        {/* Sticky Header */}
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-md py-4 mb-8 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-full border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <div className="flex overflow-x-auto gap-2 no-scrollbar w-full pb-1">
              {filteredData.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    scrollToCategory(cat.toLowerCase().replace(/\s+/g, "-"))
                  }
                  className="whitespace-nowrap px-5 py-2 rounded-full border border-primary/10 bg-card text-xs font-semibold hover:bg-primary hover:text-white transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        {filteredData.categories.map((cat) => {
          const catId = cat.toLowerCase().replace(/\s+/g, "-");
          const catProducts = filteredData.products.filter(
            (p) => p.category === cat,
          );
          if (catProducts.length === 0) return null;

          const visible = expanded[cat]
            ? catProducts
            : catProducts.slice(0, INITIAL_COUNT);

          return (
            <div key={cat} id={catId} className="mb-12 scroll-mt-32">
              <h3 className="font-heading text-xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3">
                {cat}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({catProducts.length})
                </span>
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
                    className="inline-flex items-center gap-1 rounded-lg border border-primary px-6 py-2 text-sm font-semibold text-primary hover:bg-accent"
                  >
                    {expanded[cat] ? (
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
