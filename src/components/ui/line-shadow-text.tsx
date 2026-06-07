"use client";

import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type LineShadowElement = "h1" | "h2" | "h3" | "p" | "span" | "div";

type LineShadowTextProps = Readonly<
  Omit<HTMLAttributes<HTMLElement>, "children"> & {
    as?: LineShadowElement;
    children: string;
    shadowColor?: string;
  }
>;

export function LineShadowText({
  as: Component = "span",
  children,
  className,
  shadowColor = "hsl(var(--primary))",
  style,
  ...props
}: LineShadowTextProps) {
  return (
    <Component
      aria-label={props["aria-label"] || children}
      className={cn("relative z-0 inline-flex isolate", className)}
      style={{ "--shadow-color": shadowColor, ...style } as CSSProperties}
      {...props}
    >
      <span aria-hidden="true" className="relative z-10">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-[0.04em] top-[0.04em] -z-10 animate-line-shadow bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)] bg-[length:0.06em_0.06em] bg-clip-text text-transparent"
      >
        {children}
      </span>
    </Component>
  );
}
