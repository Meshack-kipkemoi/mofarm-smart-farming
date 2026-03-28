import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-heading text-lg font-bold mb-3">
            🌿 Mofarm Smart Farming
          </h3>
          <p className="text-sm text-primary-foreground/70">
            Your trusted source for fresh farm produce in Nyeri. We supply
            restaurants, schools and businesses with quality fruits, vegetables,
            grains and more.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link
              href="#products"
              className="hover:text-secondary transition-colors"
            >
              Products
            </Link>
            <Link
              href="#contact"
              className="hover:text-secondary transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="#faq"
              className="hover:text-secondary transition-colors"
            >
              FAQs
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3">Contact Info</h4>
          <div className="space-y-2 text-sm text-primary-foreground/70">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +254 703 946365
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Nyeri, Kenya
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Delivery: Mon, Wed & Sat
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} Mofarm Smart Farming. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
