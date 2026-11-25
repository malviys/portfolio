"use client";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PillCtaProps {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Signature pill CTA inspired by portfolio-nextjs-template:
 * circular primary badge + clip-path fill wipe on hover.
 */
export function PillCta({ label, href, onClick, className }: Readonly<PillCtaProps>) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="proto-pill-cta-fill pointer-events-none absolute inset-0 rounded-full bg-primary"
      />
      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-95 group-hover:bg-primary-foreground group-hover:text-primary">
        <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
      </span>
      <span className="relative z-10 pr-2 text-sm font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary-foreground">
        {label}
      </span>
    </>
  );

  const classes = cn(
    "proto-pill-cta group inline-flex items-center gap-3 rounded-full border border-primary/40 bg-background/80 p-1.5 backdrop-blur-md transition-transform active:scale-[0.97]",
    className,
  );

  if (href && !onClick) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
