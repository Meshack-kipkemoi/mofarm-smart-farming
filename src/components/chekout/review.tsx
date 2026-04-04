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

export const Review = () => {
  const { items, totalPrice, setIsCheckoutOpen, clearCart } = useCart();

  // Get store state and actions
  const {
    name,
    phone,
    address,
    setName,
    setPhone,
    setAddress,
    setStep,
    resetCheckout,
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
      customerPhone: phone,
      deliveryAddress: address,
    });
  }, [name, phone, address, form]);

  // Watch form changes and update store in real-time
  const watchedName = form.watch("customerName");
  const watchedPhone = form.watch("customerPhone");
  const watchedAddress = form.watch("deliveryAddress");

  useEffect(() => {
    if (watchedName !== undefined) setName(watchedName);
  }, [watchedName, setName]);

  useEffect(() => {
    if (watchedPhone !== undefined) setPhone(watchedPhone);
  }, [watchedPhone, setPhone]);

  useEffect(() => {
    if (watchedAddress !== undefined) setAddress(watchedAddress);
  }, [watchedAddress, setAddress]);

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setStep("review");
      form.reset();
    }, 300);
  };

  const handleProceedToPay = (data: CheckoutFormData) => {
    // Ensure store is up to date
    setName(data.customerName);
    setPhone(data.customerPhone);
    setAddress(data.deliveryAddress);

    // Move to payment step
    setStep("payment");
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleProceedToPay)}
      className="space-y-4"
    >
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
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

      <div className="pt-3 flex justify-between items-center border-t">
        <span className="font-bold text-lg">Total</span>
        <span className="text-primary font-bold text-xl">
          KSh {totalPrice.toLocaleString()}
        </span>
      </div>

      <div className="pt-4 border-t">
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
