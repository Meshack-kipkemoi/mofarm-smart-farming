"use client";

import { useState } from "react";
import { X, Phone, CheckCircle, Copy } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const CheckoutModal = () => {
  const { items, totalPrice, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  const [step, setStep] = useState<"review" | "pay" | "done">("review");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const mpesaNumber = "+254 703 946365";

  const handleClose = () => {
    setIsCheckoutOpen(false);
    // Reset state after a delay to avoid flickering during the exit animation
    setTimeout(() => setStep("review"), 300);
  };

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("pay");
  };

  const handleConfirm = () => {
    setStep("done");
    // Simulate order processing
    setTimeout(() => {
      toast.success("Order placed successfully! We'll confirm via SMS.");
      clearCart();
      handleClose();
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
    }, 2500);
  };

  const copyNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("0703946365");
      toast.success("M-Pesa number copied!");
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={handleClose} 
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-900">
            {step === "review" && "Checkout"}
            {step === "pay" && "Pay via M-Pesa"}
            {step === "done" && "Order Confirmed!"}
          </h2>
          <button 
            onClick={handleClose} 
            className="rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {step === "review" && (
            <form onSubmit={handleProceedToPay} className="space-y-4">
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700">{item.product.name} <span className="text-slate-400">× {item.quantity}</span></span>
                    <span className="font-semibold text-slate-900">KSh {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="text-blue-600 font-bold text-xl">KSh {totalPrice.toLocaleString()}</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Delivery Details</h3>
                <div className="space-y-3">
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone number (e.g. 0712345678)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  <input
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery address in Nyeri"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                  <p className="text-xs text-amber-800 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Delivery available: Mon, Wed & Sat
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full rounded-lg bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
              >
                Proceed to Pay
              </button>
            </form>
          )}

          {step === "pay" && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="rounded-xl bg-slate-50 p-6 border border-slate-100">
                <Phone className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-1">Send payment to M-Pesa</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">{mpesaNumber}</span>
                  <button 
                    onClick={copyNumber} 
                    className="rounded-full p-2 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    title="Copy Number"
                  >
                    <Copy className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
                <p className="text-xl font-bold text-blue-600 mt-3">
                  Amount: KSh {totalPrice.toLocaleString()}
                </p>
              </div>

              <div className="text-left space-y-3 p-4 border rounded-xl border-dashed border-slate-300 bg-slate-50/50 text-sm">
                <p className="font-bold text-slate-900">How to pay:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>Go to <span className="font-semibold">M-Pesa</span> on your phone</li>
                  <li>Select <span className="font-semibold">Send Money</span></li>
                  <li>Enter number: <span className="font-semibold text-slate-900">0703 946365</span></li>
                  <li>Enter amount: <span className="font-semibold text-slate-900">KSh {totalPrice.toLocaleString()}</span></li>
                  <li>Complete transaction and wait for confirmation</li>
                </ol>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full rounded-lg bg-green-600 py-3.5 font-bold text-white hover:bg-green-700 transition-all active:scale-[0.