"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What areas do you deliver to?",
    a: "We currently deliver within Nyeri and surrounding areas. For bulk orders, we can arrange delivery to other parts of Central Kenya. Contact us for special delivery requests.",
  },
  {
    q: "What are your delivery days?",
    a: "We deliver on Monday, Wednesday and Saturday. Place your order at least a day before delivery day to ensure timely delivery.",
  },
  {
    q: "What is the minimum order for delivery?",
    a: "There is no minimum order for pickup. For delivery, we recommend a minimum order of KSh 1,000 to cover delivery logistics.",
  },
  {
    q: "Do you offer bulk/wholesale pricing?",
    a: "Yes! We specialize in supplying restaurants, schools, and institutions. Contact us for wholesale pricing on bulk orders.",
  },
  {
    q: "How do I pay for my order?",
    a: "We accept M-Pesa payments. After placing your order, send payment to +254 703 946365. Your order will be confirmed once payment is received.",
  },
  {
    q: "Are your products organic?",
    a: "Most of our produce comes from local farms in Nyeri that practice sustainable farming. While not all products are certified organic, we prioritize freshness and quality.",
  },
];

const FAQSection = () => (
  <section id="faq" className="py-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about ordering
        </p>
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:text-primary transition-colors">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
