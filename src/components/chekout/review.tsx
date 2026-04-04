// @/components/chekout/review.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CheckoutFormData, checkoutSchema } from "@/schemas/checkout";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useCart } from "@/stores/cart-store";

export const Review = () => {
  const { items, totalPrice } = useCart();

  // Get store state and actions
  const {
    name,
    email,
    phone,
    address,
    setName,
    setPhone,
    setAddress,
    setStep,
    setEmail,
  } = useCheckoutStore();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: name,
      phone: phone,
      address: address,
      email: email,
    },
  });

  // Sync form with store on mount
  useEffect(() => {
    form.reset({
      name: name,
      email: email,
      phone: phone,
      address: address,
    });
  }, [name, phone, address, email, form]);

  const handleProceedToPay = async (data: CheckoutFormData) => {
    // Ensure store is up to date
    setName(data.name);
    setEmail(data.email);
    setPhone(data.phone);
    setAddress(data.address);

    toast.loading("Initiating M-Pesa payment...", {
      id: "checkout-payment",
    });

    try {
      await axios.post("/api/checkout/pay", data);
      toast.dismiss("checkout-payment");
      toast.success("STK Push sent! Check your phone.");
      setStep("payment");
    } catch (error) {
      toast.dismiss("checkout-payment");

      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.errors) {
          // Render validation errors from backend
          Object.entries(data.errors).forEach(([field, messages]) => {
            form.setError(field as keyof CheckoutFormData, {
              message: (messages as string[])[0],
            });
          });
          toast.error("Validation failed");
        } else {
          toast.error(data.message || "Payment failed");
        }
      } else {
        toast.error("Network error");
      }
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleProceedToPay)}
      className="space-y-3"
    >
      <div className="space-y-2">
        <div className="space-y-2 max-h-40 pr-2">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between text-sm py-1 border-b"
            >
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-semibold">
                KSh {(item.product.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="text-primary font-bold text-xl">
            KSh {totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t-2 border-dashed ">
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-name">Full Name</FieldLabel>
                <Input
                  {...field}
                  id="checkout-name"
                  placeholder="Full Name"
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
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-phone">
                  M-Pesa Phone Number
                </FieldLabel>
                <Input
                  {...field}
                  id="checkout-phone"
                  type="tel"
                  placeholder="M-Pesa Phone Number"
                  aria-invalid={fieldState.invalid}
                  autoComplete="tel"
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
                <FieldLabel htmlFor="checkout-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="checkout-email"
                  type="email"
                  placeholder="Email (example@domain.com)"
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
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="checkout-address">
                  Delivery Address
                </FieldLabel>
                <Input
                  {...field}
                  id="checkout-address"
                  placeholder="Address (e.g., Nyeri Town, Stage 4)"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Proceed to Pay
      </Button>
    </form>
  );
};
