"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  User,
  CreditCard,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { CartStep } from "./cart-step";
import { PersonalDetails } from "./personal-details";
import { CheckoutStep, useCheckoutStore } from "@/stores/checkout-store";
import { Payment } from "./payment";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui/alert-dialog";
import { PaymentStatus } from "./payment-status";
import { CartSuccess } from "./cart-success";

type CartStepConfig = {
  step: CheckoutStep;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  component: React.ComponentType;
};

const cartSteps: CartStepConfig[] = [
  {
    step: "cart",
    title: "Your Cart",
    icon: ShoppingBag,
    component: CartStep,
  },
  {
    step: "review",
    title: "Personal Details",
    icon: User,
    component: PersonalDetails,
  },
  {
    step: "payment",
    title: "Payment",
    icon: CreditCard,
    component: Payment,
  },
  {
    step: "processing",
    title: "Processing Payment",
    icon: CreditCard,
    component: PaymentStatus,
  },
  {
    step: "success",
    title: "Order Confirmed!",
    icon: CheckCircle,
    component: CartSuccess,
  },
];

const CartSheet = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const step = useCheckoutStore((state) => state.step);
  const setTransactionId = useCheckoutStore((state) => state.setTransactionId);
  const clearCart = useCartStore((state) => state.clearCart);
  const setStep = useCheckoutStore((state) => state.setStep);

  // ✅ current step
  const currentStep = cartSteps.find((s) => s.step === step) || cartSteps[0]; // default to first step

  const Icon = currentStep.icon;

  const StepComponent = currentStep?.component;

  const changeCartState = (open: boolean) => {
    //if we are in the success step and trying to close the cart, we should just close it without showing the dialog
    if (step === "success") {
      setStep("cart");
      setTransactionId(null); // Clear transaction ID on close
      clearCart(); // Clear cart on close
      setIsCartOpen(open);
      return;
    }

    if (!open && step !== "cart") {
      setIsDialogOpen(true);
      return;
    }
    setIsCartOpen(open);
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={changeCartState}>
        <SheetContent className="w-full h-screen sm:w-2/3 md:w-2/5 xl:w-1/3 flex flex-col p-0 overflow-hidden">
          {/* ✅ HEADER */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="text-primary">{<Icon className="size-5" />}</div>

              <SheetTitle className="font-heading text-lg">
                {currentStep?.title}
              </SheetTitle>
            </div>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Your cart is empty</p>
              <Button
                variant="link"
                onClick={() => setIsCartOpen(false)}
                className="mt-4 font-bold"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            StepComponent && <StepComponent />
          )}
        </SheetContent>
      </Sheet>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="p-0 pt-3 overflow-hidden">
          <AlertDialogHeader className="px-4">
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave the checkout process? Your cart may
              be cleared and you may lose all progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="bg-muted/50 rounded-sm p-3">
            <AlertDialogCancel variant={"outline"}>Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setIsCartOpen(false)}
              variant={"destructive"}
            >
              Quit Checkout <ArrowRight />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CartSheet;
