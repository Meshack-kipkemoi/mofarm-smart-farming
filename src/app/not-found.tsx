"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // In Next.js, this runs on the client to log the missing path
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname,
    );
  }, [pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-4 text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-heading font-bold text-foreground">
          Oops! Page not found
        </h2>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          It looks like the fresh produce you're looking for moved to a
          different field. Let's get you back to the farm.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-heading font-bold text-primary-foreground transition hover:brightness-110 shadow-lg"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
