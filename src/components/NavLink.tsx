"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className"
> {
  href: string;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, exact = false, ...props }, ref) => {
    const pathname = usePathname();

    // Check if the link is active
    // exact: matches the path exactly
    // non-exact: matches if the path starts with the href (good for nested routes)
    const isActive = exact
      ? pathname === href
      : pathname.startsWith(href as string);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
