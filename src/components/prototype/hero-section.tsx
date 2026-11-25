"use client";

import { LaurelBadge } from "@/components/prototype/laurel-badge";
import { PillCta } from "@/components/prototype/pill-cta";
import { SignatureSvg } from "@/components/prototype/signature-svg";
import { TypewriterRole } from "@/components/ui/typewriter-role";

interface HeroSectionProps {
  onScrollTo: (selector: string) => void;
}

/**
 * Minimal centered hero paired with the shared ParticlePortrait swarm backdrop.
 */
export function HeroSection({ onScrollTo }: Readonly<HeroSectionProps>) {
  return (
    <section
      id="hero"
      className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 py-24 sm:px-8"
    >
      {/* Subtle radial readability scrim behind centered copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,hsl(var(--background)/0.62)_0%,hsl(var(--background)/0.25)_48%,transparent_80%)]"
      />

      {/* Subtle ambient watermark marquee */}
      <div
        aria-hidden="true"
        data-gsap-parallax="-0.1"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 select-none overflow-hidden opacity-[0.045] dark:opacity-[0.06]"
      >
        <div className="proto-marquee-track text-[5.5rem] font-semibold tracking-tight sm:text-[8.5rem] lg:text-[11.5rem]">
          <span className="pr-14">Sourabh Malviya •</span>
          <span className="pr-14">Sourabh Malviya •</span>
          <span className="pr-14">Sourabh Malviya •</span>
          <span className="pr-14">Sourabh Malviya •</span>
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <SignatureSvg mountAnimated className="mb-3 h-14 w-64 sm:h-16 sm:w-72" />

        <h1
          data-gsap-hero="split"
          className="text-4xl font-semibold leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.2] md:text-6xl md:leading-[1.2]"
        >
          Hi, I am Sourabh Malviya
        </h1>

        <p
          data-gsap-hero="stagger"
          className="mt-3 text-lg font-medium text-primary sm:text-2xl"
        >
          <TypewriterRole />
        </p>

        <p
          data-gsap-hero="stagger"
          className="mt-6 max-w-lg text-sm font-medium leading-relaxed text-foreground/85 sm:text-base"
        >
          Building products that people love — from mobile apps to scalable platforms.
        </p>

        {/* Bottom hero row */}
        <div
          data-gsap-hero="stagger"
          className="mt-10 flex flex-wrap items-center justify-center gap-6"
        >
          <LaurelBadge
            years="6+"
            label="6+ Years of Experience"
            subtitle="Professional software engineering since 2020"
          />

          <PillCta label="Talk to me" onClick={() => onScrollTo("#contact")} />

          <button
            type="button"
            onClick={() => onScrollTo("#projects")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View work ↓
          </button>
        </div>
      </div>
    </section>
  );
}
