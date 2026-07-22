"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App-themed toast host. The platform is light-only, so we pin the theme and
 * lean on Sonner's rich colors for success/destructive semantics while shaping
 * the surface to match the app's cards (rounded-xl border, sans font).
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      richColors
      closeButton
      className="toaster group"
      style={{ fontFamily: "var(--font-sans)" } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:border-border group-[.toaster]:rounded-xl group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
