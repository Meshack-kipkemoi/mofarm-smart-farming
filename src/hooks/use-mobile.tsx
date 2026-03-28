"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize as undefined to avoid mismatch between server and client
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add listener for screen resizing
    mql.addEventListener("change", onChange);

    // Set initial value on mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return false as a default if undefined (server-side),
  // otherwise return the actual boolean state.
  return !!isMobile;
}
