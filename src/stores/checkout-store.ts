// @/stores/checkout-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type CheckoutStep =
  | "cart"
  | "review"
  | "payment"
  | "processing"
  | "success";
export type PaymentStatus = "pending" | "completed" | "failed";

type CheckoutState = {
  // Form fields
  name: string;
  email: string;
  phone: string;
  address: string;
  payment_phone: string;

  // Step management
  step: CheckoutStep;

  // Payment status
  paymentStatus: PaymentStatus;

  // Transaction ID for checkout
  transactionId: string | null;

  // Actions
  setTransactionId: (id: string | null) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setAddress: (address: string) => void;
  setPaymentPhone: (phone: string) => void;
  setStep: (step: CheckoutStep) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  resetCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  immer(
    persist(
      (set) => ({
        // Initial state
        name: "",
        email: "",
        phone: "",
        address: "",
        payment_phone: "",
        step: "cart",
        paymentStatus: "pending",
        transactionId: null,

        // Fixed typo: setTransationId → setTransactionId
        setTransactionId: (id) =>
          set((state) => {
            state.transactionId = id;
          }),

        // Form actions
        setName: (name) =>
          set((state) => {
            state.name = name;
          }),

        setEmail: (email) =>
          set((state) => {
            state.email = email;
          }),

        setPhone: (phone) =>
          set((state) => {
            state.phone = phone;
          }),

        setAddress: (address) =>
          set((state) => {
            state.address = address;
          }),

        setPaymentPhone: (phone) =>
          set((state) => {
            state.payment_phone = phone;
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
            state.email = "";
            state.phone = "";
            state.address = "";
            state.step = "cart";
            state.paymentStatus = "pending";
            state.transactionId = null;
          }),
      }),
      {
        name: "mofarm_checkout", // Unique storage key
        // Optional: Only persist specific fields (exclude sensitive data if needed)
        partialize: (state) => ({
          name: state.name,
          email: state.email,
          phone: state.phone,
          payment_phone: state.payment_phone,
          address: state.address,
          step: state.step,
          paymentStatus: state.paymentStatus,
          transactionId: state.transactionId,
        }),
      },
    ),
  ),
);
