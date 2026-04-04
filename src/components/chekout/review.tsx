// @/components/chekout/review.tsx
"use client";

import { useCart } from "@/context/CartContext";
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
import axioS from "axios";
import { toast } from "sonner";

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
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
    },
  });

  // Sync form with store on mount
  useEffect(() => {
    form.reset({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      deliveryAddress: address,
    });
  }, [name, phone, address, form]);

  const handleProceedToPay = async (data: CheckoutFormData) => {
    // Ensure store is up to date
    setName(data.customerName);
    setEmail(data.customerEmail);
    setPhone(data.customerPhone);
    setAddress(data.deliveryAddress);

    toast.loading("Initiating M-Pesa payment...");

    //Send the user the stk push
    const res = await axioS.post("/api/checkout/pay", {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
      address: data.deliveryAddress,
    });

    if (res.status === 200) {
      toast.dismiss();
      toast.success("STK Push sent! Check your phone.");
      // Move to payment step
      setStep("payment");
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
            name="customerName"
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
            name="customerPhone"
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
            name="customerEmail"
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
            name="deliveryAddress"
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
