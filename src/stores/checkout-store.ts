// @/stores/checkout-store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type CheckoutStep = "review" | "payment" | "done";
export type PaymentStatus = "pending" | "completed" | "failed";

type CheckoutState = {
  // Form fields
  name: string;
  phone: string;
  address: string;

  // Step management
  step: CheckoutStep;

  // Payment status
  paymentStatus: PaymentStatus;

  // Actions
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setAddress: (address: string) => void;
  setStep: (step: CheckoutStep) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  resetCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  immer((set) => ({
    // Initial state
    name: "",
    phone: "",
    address: "",
    step: "review",
    paymentStatus: "pending",

    // Form actions
    setName: (name) =>
      set((state) => {
        state.name = name;
      }),

    setPhone: (phone) =>
      set((state) => {
        state.phone = phone;
      }),

    setAddress: (address) =>
      set((state) => {
        state.address = address;
      }),

    // Step management
    setStep: (step) =>
      set((state) => {
        state.step = step;
      }),

    // Payment status
    setPaymentStatus: (status) =>
      set((state) => {
        state.paymentStatus = status;
      }),

    // Reset entire checkout (call after order complete)
    resetCheckout: () =>
      set((state) => {
        state.name = "";
        state.phone = "";
        state.address = "";
        state.step = "review";
        state.paymentStatus = "pending";
      }),
  })),
);
