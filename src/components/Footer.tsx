import Link from "next/link";
import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { MofarmLogo } from "./logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "#products", label: "Products" },
    { href: "#contact", label: "Contact Us" },
    { href: "#faq", label: "FAQs" },
  ];

  return (
    <footer className="relative border-t bg-muted/30 backdrop-blur-sm">
      {/* Gradient accent line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <MofarmLogo className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Mofarm Smart Farming
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Fresh from the farm
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Your trusted source for fresh farm produce in Nyeri. We supply
              restaurants, schools and businesses with quality fruits,
              vegetables, grains and more.
            </p>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Accepting orders
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm text-muted-foreground transition-all hover:text-foreground hover:translate-x-1"
                  >
                    <ArrowRight className="mr-2 h-3 w-3 opacity-0 -ml-5 transition-all group-hover:opacity-100 group-hover:ml-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Info
            </h4>
            <div className="space-y-4">
              <a
                href="tel:+254703946365"
                className="group flex items-start gap-3 text-sm transition-colors hover:text-foreground"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">+254 703 946365</p>
                  <p className="text-xs text-muted-foreground">
                    Call or WhatsApp
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Nyeri, Kenya</p>
                  <p className="text-xs text-muted-foreground">
                    Central Highlands
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Mon, Wed & Sat</p>
                  <p className="text-xs text-muted-foreground">
                    Delivery schedule
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-xs text-muted-foreground md:text-left">
            © {currentYear} Mofarm Smart Farming. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span className="text-border">|</span>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
