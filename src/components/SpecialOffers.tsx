"use client";

import { ProductOffer } from "@/types/offer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Tag, ShoppingBasket } from "lucide-react";
import { Button } from "./ui/button";
import { Image } from "./ui/image";
import { useCartStore } from "@/stores/cart-store";
import { useEffect } from "react";

/* ─── helpers ─────────────────────────────────────────────── */
function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

function daysLeft(validTo: string) {
  const diff = new Date(validTo).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Ends today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/* ─── single card ──────────────────────────────────────────── */
function OfferCard({ offer, index }: { offer: ProductOffer; index: number }) {
  const savings = offer.price - offer.discounted_price;
  const { addToCart } = useCartStore();

  return (
    <Card
      className="group relative overflow-hidden py-0 pb-3 gap-3"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Discount badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-rose-200 tracking-wide">
          <Tag className="w-3 h-3" />
          {offer.discount_percentage}% OFF
        </span>
      </div>

      {/* Days left badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur text-slate-600 text-xs font-medium px-2 py-1 rounded-full border border-slate-100 shadow-sm">
          <Clock className="w-3 h-3 text-amber-500" />
          {daysLeft(offer.valid_to)}
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-50">
        <Image
          src={offer.image_url}
          alt={offer.product_name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category */}
        <Badge
          variant="secondary"
          className="text-[10px] uppercase tracking-widest"
        >
          {offer.category}
        </Badge>

        {/* Name + description */}
        <div>
          <div className="flex justify-between">
            <h3 className="font-bold text-lg leading-tight tracking-tight">
              {offer.product_name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {offer.stock_quantity} in stock
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {offer.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-2">
          <span className="text-2xl font-extrabold tracking-tight">
            {formatPrice(offer.discounted_price)}
          </span>
          <span className="text-sm text-muted-foreground line-through mb-0.5">
            {formatPrice(offer.price)}
          </span>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Save {formatPrice(savings)}
          </span>
        </div>

        {/* Savings pill */}

        {/* CTA */}
        <Button
          className="w-full mt-1"
          onClick={() => addToCart(offer.product_id)}
        >
          <ShoppingBasket />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── main component ───────────────────────────────────────── */
const SpecialOffers = ({ offers }: { offers: ProductOffer[] }) => {
  if (!offers.length) return null;
  const setDiscountedProducts = useCartStore(
    (state) => state.setDiscountedProducts,
  );

  useEffect(() => {
    setDiscountedProducts(offers);
  }, [setDiscountedProducts]);

  return (
    <section className="w-full py-10 px-4 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-rose-500 mb-1">
            Limited time
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            Special Offers
          </h2>
          <p className="text-muted-foreground text-sm mt-1.5">
            Fresh deals — updated daily
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground hidden md:block">
          {offers.length} active {offers.length === 1 ? "offer" : "offers"}
        </span>
      </div>

      {/* Carousel */}
      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent className="-ml-4">
          {offers.map((offer, i) => (
            <CarouselItem
              key={offer.offer_id}
              className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <OfferCard offer={offer} index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Nav buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <CarouselPrevious className="static translate-y-0 h-9 w-9 rounded-xl shadow-sm" />
          <CarouselNext className="static translate-y-0 h-9 w-9 rounded-xl  shadow-sm" />
        </div>
      </Carousel>
    </section>
  );
};

export default SpecialOffers;
