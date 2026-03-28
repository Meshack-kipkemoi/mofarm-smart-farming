"use client";

import { useState } from "react";
import { Send, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            Contact Us
          </h2>
          <p className="text-muted-foreground mt-2">
            Have questions? We'd love to hear from you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Map + info */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border shadow-sm h-64">
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
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent p-2">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground">
                    +254 703 946365
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent p-2">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">Nyeri, Kenya</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Days</p>
                  <p className="font-semibold text-foreground">
                    Monday, Wednesday & Saturday
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
