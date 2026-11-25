"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

import "@/components/prototype/prototype.css";
import { AboutSection } from "@/components/prototype/about-section";
import { CraftSection } from "@/components/prototype/craft-section";
import { FloatingDock } from "@/components/prototype/floating-dock";
import { HeroSection } from "@/components/prototype/hero-section";
import { JourneySection } from "@/components/prototype/journey-section";
import { ParticlePortrait } from "@/components/prototype/particle-portrait";
import { ProjectsSection } from "@/components/prototype/projects-section";
import {
  PrototypePostSummary,
  WritingAndConnect,
} from "@/components/prototype/writing-and-connect";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

const trackedSections = ["hero", "about", "journey", "projects", "craft", "writing", "contact"];

interface PrototypeClientProps {
  posts: PrototypePostSummary[];
}

/**
 * Coordinates GSAP 3.14 scroll choreography (ScrollTrigger, SplitText, ScrollToPlugin)
 * across the architectural prototype layout with full reduced-motion support.
 */
export function PrototypeClient({ posts }: Readonly<PrototypeClientProps>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [dockVisible, setDockVisible] = useState(false);

  const scrollToTarget = useCallback((selector: string) => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      document.querySelector(selector)?.scrollIntoView({ behavior: "auto" });
      return;
    }

    gsap.to(window, {
      duration: 0.95,
      scrollTo: { y: selector, offsetY: 64 },
      ease: "power3.inOut",
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      // Top scroll progress bar
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      }

      // Show floating dock once scrolled past top half of hero
      ScrollTrigger.create({
        trigger: "#hero",
        start: "bottom 70%",
        onEnter: () => setDockVisible(true),
        onLeaveBack: () => setDockVisible(false),
      });

      // Track active section in dock
      trackedSections.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Hero masked SplitText + staggered reveal
        const heroHeading = root.querySelector<HTMLElement>("[data-gsap-hero='split']");
        if (heroHeading) {
          const split = SplitText.create(heroHeading, {
            type: "lines,words",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.words, {
                yPercent: 110,
                opacity: 0,
                duration: 0.85,
                stagger: 0.06,
                ease: "power3.out",
              });
            },
          });
          splits.push(split);
        }

        const mountSigPaths = root.querySelectorAll<SVGPathElement>(
          "[data-gsap-signature-mount='true'] path",
        );
        if (mountSigPaths.length > 0) {
          mountSigPaths.forEach((path) => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          });
          gsap.to(mountSigPaths, {
            strokeDashoffset: 0,
            duration: 1.3,
            stagger: 0.25,
            ease: "power2.inOut",
          });
        }

        const heroStagger = root.querySelectorAll("[data-gsap-hero='stagger']");
        if (heroStagger.length > 0) {
          gsap.from(heroStagger, {
            y: 24,
            opacity: 0,
            duration: 0.75,
            stagger: 0.09,
            delay: 0.15,
            ease: "power3.out",
            clearProps: "transform",
          });
        }

        // 2. Scroll-scrubbed parallax elements
        root.querySelectorAll<HTMLElement>("[data-gsap-parallax]").forEach((el) => {
          const speed = Number.parseFloat(el.dataset.gsapParallax || "0.08");
          gsap.to(el, {
            y: () => speed * -180,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        });

        // 3. Section headings SplitText reveal
        root.querySelectorAll<HTMLElement>("[data-gsap-split='heading']").forEach((heading) => {
          const split = SplitText.create(heading, {
            type: "lines,words",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.words, {
                yPercent: 100,
                opacity: 0,
                duration: 0.7,
                stagger: 0.045,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: heading,
                  start: "top 85%",
                  once: true,
                },
              });
            },
          });
          splits.push(split);
        });

        // 4. Cards reveal on scroll
        gsap.utils.toArray<HTMLElement>("[data-gsap-reveal='card']").forEach((card, idx) => {
          gsap.from(card, {
            y: 28,
            opacity: 0,
            duration: 0.65,
            delay: (idx % 3) * 0.08,
            ease: "power2.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          });
        });

        // 5. Tabular count-up metrics
        root.querySelectorAll<HTMLElement>("[data-gsap-count]").forEach((el) => {
          const target = Number.parseInt(el.dataset.gsapCount || "0", 10);
          const suffix = el.dataset.gsapSuffix || "";
          const counter = { value: 0 };

          gsap.to(counter, {
            value: target,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
            onUpdate: () => {
              el.textContent = `${Math.round(counter.value)}${suffix}`;
            },
          });
        });
      });

      // Reduced-motion fallback ensures metric targets display immediately
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.querySelectorAll<HTMLElement>("[data-gsap-count]").forEach((el) => {
          const target = el.dataset.gsapCount || "0";
          const suffix = el.dataset.gsapSuffix || "";
          el.textContent = `${target}${suffix}`;
        });
      });
    }, root);

    return () => {
      splits.forEach((s) => s.revert());
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-background text-foreground">
      {/* GSAP Scroll Progress Bar */}
      <div
        ref={progressRef}
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary via-purple-500 to-sky-400"
      />

      {/* Clean open layout matching portfolio-nextjs-template */}
      <main>
        <div className="relative overflow-x-clip">
          <ParticlePortrait />
          <HeroSection onScrollTo={scrollToTarget} />
          <AboutSection />
        </div>
        <JourneySection />
        <ProjectsSection />
        <CraftSection />
        <WritingAndConnect posts={posts} />
      </main>

      <FloatingDock
        activeSection={activeSection}
        visible={dockVisible}
        onNavigate={scrollToTarget}
      />
    </div>
  );
}
