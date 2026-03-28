"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Assuming these are in your public folder or handled by a loader
import heroFruits from "@/assets/hero-fruits.jpg";
import heroVegetables from "@/assets/hero-vegetables.jpg";
import heroGrains from "@/assets/hero-grains.jpg";

const slides = [
  {
    image: heroFruits,
    title: "Farm-Fresh Fruits",
    subtitle:
      "Juicy, ripe & delivered straight from Nyeri farms to your kitchen",
  },
  {
    image: heroVegetables,
    title: "Organic Vegetables",
    subtitle: "The freshest greens for restaurants, schools & bulk buyers",
  },
  {
    image: heroGrains,
    title: "Premium Grains & Cereals",
    subtitle: "Quality beans, rice, maize & more at wholesale prices",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((p) => (p + 1) % slides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0} // Load first image immediately
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight uppercase tracking-wide">
              {slides[current].title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              {slides[current].subtitle}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-heading font-bold text-primary-foreground transition hover:brightness-110 shadow-lg"
              >
                Shop Now <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center rounded-lg border border-white/50 px-8 py-3 font-heading font-bold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/20 backdrop-blur-sm p-2 shadow hover:bg-black/40 text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/20 backdrop-blur-sm p-2 shadow hover:bg-black/40 text-white"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-3 rounded-full transition-all duration-300 ${i === current ? "w-10 bg-primary" : "w-3 bg-white/50"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
