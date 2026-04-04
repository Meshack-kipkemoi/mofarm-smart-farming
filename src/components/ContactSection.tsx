"use client";

import { Send, Phone, MapPin, Clock, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Schema definition (move to @/schemas/contact.ts if preferred)
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactInfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  subtext?: string;
}

const contactInfo: ContactInfoItem[] = [
  {
    icon: Phone,
    label: "Phone",
    value: "+254 703 946365",
    href: "tel:+254703946365",
    subtext: "Call or WhatsApp",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Nyeri, Kenya",
    subtext: "Central Highlands",
  },
  {
    icon: Clock,
    label: "Delivery Days",
    value: "Monday, Wednesday & Saturday",
    subtext: "Fresh delivery schedule",
  },
];

const ContactSection = () => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    form.reset();
  };

  return (
    <section id="contact" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Contact Us
          </h2>
          <p className="text-muted-foreground mt-2">
            Have questions? We&apos;d love to hear from you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Map + Contact Info */}
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden border shadow-sm h-64 bg-card">
              <iframe
                title="Mofarm Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63819.17!2d36.9!3d-0.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18285e1a1e1a1a1a%3A0x1a1a1a1a1a1a1a1a!2sNyeri%2C%20Kenya!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-3 group cursor-pointer">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {item.label}
                      </p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {item.value}
                      </p>
                      {item.subtext && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.subtext}
                        </p>
                      )}
                    </div>
                  </div>
                );

                return item.href ? (
                  <a key={index} href={item.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="rounded-lg border bg-card p-6"
          >
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="contact-name"
                      placeholder="Your name"
                      aria-invalid={fieldState.invalid}
                      autoComplete="name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="contact-message">Message</FieldLabel>
                    <textarea
                      {...field}
                      id="contact-message"
                      rows={4}
                      placeholder="How can we help you?"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
