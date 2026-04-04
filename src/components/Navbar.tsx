// @/components/navbar.tsx
"use client";
import { ShoppingCart, Menu, Phone, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MofarmLogo } from "./logo";
import { Separator } from "./ui/separator";

const navLinks = [
  { id: "products", label: "Products" },
  { id: "contact", label: "Contact" },
  { id: "faq", label: "FAQs" },
];

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <div className={`transition-all duration-300 overflow-hidden`}>
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto flex items-center justify-between px-4 py-2 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                +254 703 946365
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Nyeri, Kenya
              </span>
            </div>
            <span className="font-medium text-xs tracking-wide">
              Mon, Wed & Sat Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={cn(
          `fixed top-10 z-50 transition-all duration-300 w-full`,
          scrolled && "bg-background/80 backdrop-blur-sm shadow-sm top-0",
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Button
            variant="ghost"
            onClick={() => scrollTo("hero")}
            className="gap-3 hover:bg-transparent px-0 group"
            asChild
          >
            <Link href="/">
              <MofarmLogo className="size-12" />
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span
                  className={`font-bold text-base tracking-tight transition-colors duration-300 ${
                    scrolled ? "text-foreground" : "text-white"
                  }`}
                >
                  Mofarm
                </span>
                <span
                  className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                    scrolled ? "text-muted-foreground" : "text-white/60"
                  }`}
                >
                  Smart Farming
                </span>
              </div>
            </Link>
          </Button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ id, label }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => scrollTo(id)}
                className={`rounded-full text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? "text-foreground hover:text-primary hover:bg-primary/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              size="icon-lg"
              className="relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="size-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1.5 -top-1.5 size-4">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className={cn(`text-white`, scrolled && "text-foreground")}
                >
                  <Menu />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-3/4 sm:w-1/2 lg:w-1/4">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2.5 text-base font-semibold">
                    <MofarmLogo className="size-8" />
                    Mofarm Smart Farming
                  </SheetTitle>
                </SheetHeader>

              <div className="flex flex-col h-full justify-between p-6">
                {/* Nav links */}
                <nav className="flex flex-col gap-1 mt-6">
                  {navLinks.map(({ id, label }) => (
                    <>
                      <Button
                        key={id}
                        variant="ghost"
                        className="justify-start text-base font-normal h-11 rounded-lg text-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => scrollTo(id)}
                      >
                        {label}
                      </Button>
                      <Separator />
                    </>
                  ))}
                </nav>

                {/* Contact info */}
                <div className="bg-muted rounded-xl p-4 space-y-2.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Contact & Delivery
                  </p>
                  <div className="flex items-center gap-2.5 text-sm text-foreground">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                    </div>
                    +254 703 946365
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-foreground">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    Nyeri, Kenya
                  </div>
                  <div className="pt-1">
                    <Badge variant="secondary" className="text-xs font-medium">
                      Mon, Wed & Sat Delivery
                    </Badge>
                  </div>
                </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
