// components/ProductCard.tsx
"use client";

import { Plus, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useState } from "react";
import { Image } from "./ui/image";
import { useCart } from "@/stores/cart-store";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {product.image_url && (
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-3">
        <span className="text-xs text-muted-foreground">
          {product.category}
        </span>
        <h3 className="font-heading font-semibold text-foreground truncate">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-bold text-primary">
            KSh {product.price.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">
              /kg
            </span>
          </span>
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`rounded-full p-2 transition-all active:scale-90 ${
              added
                ? "bg-primary text-primary-foreground shadow-inner"
                : "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {added ? (
              <Check className="h-4 w-4 animate-in zoom-in duration-200" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
