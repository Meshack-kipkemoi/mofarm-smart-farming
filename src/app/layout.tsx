import type { Metadata } from "next";
import { Inter, Montserrat, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/chekout/CheckoutModal";
import Footer from "@/components/Footer"; // Import it here
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Mofarm Smart Farming | Fresh Produce Nyeri",
  description:
    "Direct from farm to your business. Quality fruits, vegetables and grains in Nyeri, Kenya.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("scroll-smooth", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          <Navbar />
          {/* Use a flex-col wrapper to push footer to bottom on short pages */}
          <div className="flex flex-col min-h-screen">
            <main className="grow">{children}</main>
            <Footer />
          </div>

          <CartDrawer />
          <CheckoutModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
