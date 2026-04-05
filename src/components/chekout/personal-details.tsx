// @/components/chekout/review.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CheckoutFormData, checkoutSchema } from "@/schemas/checkout";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useEffect } from "react";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import { OrderSummary } from "./order-summary";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useShallow } from "zustand/shallow";

export const PersonalDetails = () => {
  // Get store state and actions
  const name = useCheckoutStore((state) => state.name);
  const email = useCheckoutStore((state) => state.email);
  const phone = useCheckoutStore((state) => state.phone);
  const address = useCheckoutStore((state) => state.address);
  const setName = useCheckoutStore((state) => state.setName);
  const setPhone = useCheckoutStore((state) => state.setPhone);
  const setAddress = useCheckoutStore((state) => state.setAddress);
  const setEmail = useCheckoutStore((state) => state.setEmail);
  const setStep = useCheckoutStore(useShallow((state) => state.setStep));

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
    setStep("payment");
  };

  return (
    <ScrollArea className="h-0 flex-1">
      <div className="pt-3">
        <div className="px-4">
          <OrderSummary />
        </div>
        <form
          onSubmit={form.handleSubmit(handleProceedToPay)}
          className="space-y-3"
        >
          <div className="p-4">
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
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      placeholder="Phone Number (e.g., +254701234567)"
                      aria-invalid={fieldState.invalid}
                      autoComplete="tel"
                    />
                    <FieldDescription>
                      This is the number that will contact you with for any
                      updates.
                    </FieldDescription>
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
          <div className="flex gap-2 pt-3 sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4 rounded-t-lg">
            <Button
              type="button"
              size="xl"
              variant={"outline"}
              onClick={() => setStep("cart")}
              className="flex-1"
            >
              <ArrowLeft /> Back
            </Button>
            <Button type="submit" size="xl" className="flex-3">
              Proceed to Pay <ArrowRight />
            </Button>
          </div>
        </form>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};
