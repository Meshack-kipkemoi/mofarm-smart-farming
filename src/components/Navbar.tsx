"use client";

import { ShoppingCart, Menu, X, Phone, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrolled ? "h-0 overflow-hidden opacity-0" : "opacity-100"}`}
      >
        <div className="bg-primary/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm text-primary-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> +254 703 946365
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Nyeri, Kenya
              </span>
            </div>
            <span className="text-xs">Delivery: Mon, Wed & Sat</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "top-0 bg-white/95 backdrop-blur-md shadow-sm border-b" : "top-[36px] bg-transparent"}`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => scrollTo("hero")}
            className={`font-heading text-xl font-bold transition-colors ${scrolled ? "text-primary" : "text-white"}`}
          >
            🌿 Mofarm{" "}
            <span className={scrolled ? "text-slate-600" : "text-white"}>
              Smart Farming
            </span>
          </button>

          <div
            className={`hidden md:flex items-center gap-6 text-sm font-medium transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}
          >
            <button
              onClick={() => scrollTo("products")}
              className="hover:text-primary transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="hover:text-primary transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="hover:text-primary transition-colors"
            >
              FAQs
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full bg-primary p-2 text-primary-foreground transition hover:scale-105 active:scale-95 shadow-md"
              aria-label="Open Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              className={`md:hidden transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4 text-sm font-bold shadow-xl animate-in slide-in-from-top duration-300">
            <button
              onClick={() => scrollTo("products")}
              className="text-left text-slate-900 hover:text-primary py-2 border-b border-slate-50"
            >
              Products
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="text-left text-slate-900 hover:text-primary py-2 border-b border-slate-50"
            >
              Contact
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-left text-slate-900 hover:text-primary py-2 border-b border-slate-50"
            >
              FAQs
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
