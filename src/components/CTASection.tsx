import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="py-20 bg-primary">
    <div className="container mx-auto px-4 text-center">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
        Ready to Order Fresh Farm Produce?
      </h2>
      <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
        Join restaurants, schools and businesses across Nyeri who trust Mofarm
        for quality, freshness and reliable delivery every Monday, Wednesday &
        Saturday.
      </p>
      <Link
        href="#products"
        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-8 py-3 font-heading font-bold text-secondary-foreground hover:brightness-110 transition shadow-lg"
      >
        Start Shopping <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  </section>
);

export default CTASection;
