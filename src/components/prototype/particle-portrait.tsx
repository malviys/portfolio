"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  inCrop: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  size: number;
  rLight: number;
  gLight: number;
  bLight: number;
  alphaLight: number;
  sizeLight: number;
  phase: number;
  swarmDelay: number;
  arcX: number;
  arcY: number;
}

interface ParticlePortraitProps {
  src?: string;
  fullSrc?: string;
  className?: string;
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Interactive particle portrait spanning Hero -> About:
 * starts as a right-aligned silhouette in Hero (with pointer hover distortion)
 * and swarms organically on scroll down directly into the About profile picture.
 */
export function ParticlePortrait({
  src = "/images/profile/malviys-cutout.png",
  fullSrc = "/images/profile/malviys-portrait.jpg",
  className,
}: Readonly<ParticlePortraitProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isLightRef = useRef(resolvedTheme === "light");
  const drawStaticRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isLightRef.current = resolvedTheme === "light";
    drawStaticRef.current?.();
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stage = canvas.parentElement;
    if (!stage) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let stageW = 0;
    let stageH = 0;
    let dpr = 1;
    let imageLoaded: HTMLImageElement | null = null;
    let fullImageLoaded: HTMLImageElement | null = null;
    let destroyed = false;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const pointer = {
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      active: false,
    };

    const syncAboutImage = (p: number) => {
      const aboutImg = stage.querySelector<HTMLElement>("[data-gsap-about-image='true']");
      if (!aboutImg) return;
      if (prefersReduced) {
        aboutImg.style.opacity = "1";
        aboutImg.style.filter = "none";
        aboutImg.style.transform = "scale(1)";
        return;
      }
      const reveal = smoothstep(0.76, 0.96, p);
      const blurPx = (1 - reveal) * 6;
      const scale = 1.03 - reveal * 0.03;
      aboutImg.style.opacity = reveal.toFixed(3);
      aboutImg.style.filter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : "none";
      aboutImg.style.transform = `scale(${scale.toFixed(4)})`;
    };

    const buildParticles = () => {
      if (!imageLoaded || !stage) return;

      const heroEl = stage.querySelector<HTMLElement>("#hero");
      const aboutPortraitEl = stage.querySelector<HTMLElement>("[data-gsap-about-portrait='true']");
      if (!heroEl) return;

      const stageRect = stage.getBoundingClientRect();
      const heroRect = heroEl.getBoundingClientRect();
      stageW = stageRect.width;
      stageH = stageRect.height;
      if (stageW === 0 || stageH === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(stageW * dpr);
      canvas.height = Math.floor(stageH * dpr);
      canvas.style.width = `${stageW}px`;
      canvas.style.height = `${stageH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const heroW = heroRect.width;
      const heroH = heroRect.height;
      const heroTop = heroRect.top - stageRect.top;

      // Hero portrait layout (scaled larger and anchored to bottom-right inside #hero)
      const imgAspect = imageLoaded.width / imageLoaded.height;
      const targetHeight = Math.min(heroH * 0.98, heroW < 640 ? 540 : 880);
      const targetWidth = targetHeight * imgAspect;
      const heroDrawW = Math.min(targetWidth, heroW * 0.96);
      const heroDrawH = heroDrawW / imgAspect;
      const heroOffsetX = Math.max(0, heroW - heroDrawW);
      const heroOffsetY = heroTop + (heroH - heroDrawH);

      // About portrait target layout (matching object-cover inside aspect-square)
      let aboutLeft = heroOffsetX;
      let aboutTop = heroOffsetY;
      let aboutW = heroDrawW;
      let aboutH = heroDrawH;
      if (aboutPortraitEl) {
        const aboutRect = aboutPortraitEl.getBoundingClientRect();
        aboutLeft = aboutRect.left - stageRect.left;
        aboutTop = aboutRect.top - stageRect.top;
        aboutW = aboutRect.width;
        aboutH = aboutRect.height;
      }

      const coverH = aboutH;
      const coverW = coverH * imgAspect;
      const coverOffsetX = (aboutW - coverW) / 2;

      const offscreen = document.createElement("canvas");
      const sampleW = Math.max(80, Math.round(heroDrawW));
      const sampleH = Math.max(80, Math.round(heroDrawH));
      offscreen.width = sampleW;
      offscreen.height = sampleH;

      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;
      offCtx.drawImage(imageLoaded, 0, 0, sampleW, sampleH);

      const { data } = offCtx.getImageData(0, 0, sampleW, sampleH);

      let fullData: Uint8ClampedArray | null = null;
      if (fullImageLoaded) {
        const fullCanvas = document.createElement("canvas");
        fullCanvas.width = sampleW;
        fullCanvas.height = sampleH;
        const fullCtx = fullCanvas.getContext("2d", { willReadFrequently: true });
        if (fullCtx) {
          fullCtx.drawImage(fullImageLoaded, 0, 0, sampleW, sampleH);
          fullData = fullCtx.getImageData(0, 0, sampleW, sampleH).data;
        }
      }

      const step = Math.max(4, Math.round(heroDrawW / 145));
      const nextParticles: Particle[] = [];

      for (let py = 0; py < sampleH; py += step) {
        for (let px = 0; px < sampleW; px += step) {
          const idx = (py * sampleW + px) * 4;
          const a = data[idx + 3];
          const u = px / sampleW;
          const v = py / sampleH;

          const startX = heroOffsetX + px;
          const startY = heroOffsetY + py;

          const rawEndX = aboutLeft + coverOffsetX + u * coverW;
          const rawEndY = aboutTop + v * aboutH;
          const inCrop = rawEndX >= aboutLeft + 2 && rawEndX <= aboutLeft + aboutW - 2;
          const endX = Math.max(aboutLeft + 4, Math.min(aboutLeft + aboutW - 4, rawEndX));
          const endY = rawEndY;

          const scatter = prefersReduced ? 0 : 8;

          if (a >= 100) {
            const rawR = data[idx];
            const rawG = data[idx + 1];
            const rawB = data[idx + 2];

            const lum = (0.299 * rawR + 0.587 * rawG + 0.114 * rawB) / 255;

            let r = rawR;
            let g = rawG;
            let b = rawB;
            if (lum < 0.25) {
              r = Math.min(255, r + 52);
              g = Math.min(255, g + 58);
              b = Math.min(255, b + 88);
            }

            let rLight = rawR;
            let gLight = rawG;
            let bLight = rawB;
            if (lum > 0.68) {
              rLight = Math.round(rawR * 0.78);
              gLight = Math.round(rawG * 0.76);
              bLight = Math.round(rawB * 0.8);
            }

            nextParticles.push({
              startX,
              startY,
              endX,
              endY,
              inCrop,
              x: startX + (Math.random() - 0.5) * scatter,
              y: startY + (Math.random() - 0.5) * scatter,
              vx: 0,
              vy: 0,
              r,
              g,
              b,
              alpha: (a / 255) * 0.62,
              size: 1.4 + lum * 1.25,
              rLight,
              gLight,
              bLight,
              alphaLight: (a / 255) * 0.88,
              sizeLight: 1.75 + (1 - lum) * 0.35,
              phase: Math.random() * Math.PI * 2,
              swarmDelay: (1 - v) * 0.13 + Math.random() * 0.09,
              arcX: (Math.random() - 0.5) * Math.min(220, stageW * 0.2),
              arcY: (Math.random() - 0.5) * 80,
            });
            continue;
          }

          // Sparse yellow/amber & circuit-trace particles from the original portrait backdrop
          const normDist = Math.hypot((u - 0.58) * 1.15, (v - 0.54) * 1.05);
          if (normDist > 0.62) continue;
          const auraFade = 1 - smoothstep(0.24, 0.62, normDist);
          if (auraFade <= 0.04) continue;

          const bgR = fullData ? fullData[idx] : 255;
          const bgG = fullData ? fullData[idx + 1] : 192;
          const bgB = fullData ? fullData[idx + 2] : 4;
          const isCircuitTrace = Boolean(fullData && bgG < 182 && bgR > 180);

          if (!isCircuitTrace && Math.random() > 0.16) continue;
          if (isCircuitTrace && Math.random() > 0.55) continue;

          const rLight = Math.round(bgR * 0.85);
          const gLight = Math.round(bgG * 0.74);
          const bLight = Math.round(bgB * 0.7);
          const backdropSize = isCircuitTrace ? 1.55 : 1.15 + Math.random() * 0.65;

          nextParticles.push({
            startX,
            startY,
            endX,
            endY,
            inCrop,
            x: startX + (Math.random() - 0.5) * scatter * 1.4,
            y: startY + (Math.random() - 0.5) * scatter * 1.4,
            vx: 0,
            vy: 0,
            r: bgR,
            g: bgG,
            b: bgB,
            alpha: (isCircuitTrace ? 0.36 : 0.22) * auraFade,
            size: backdropSize,
            rLight,
            gLight,
            bLight,
            alphaLight: (isCircuitTrace ? 0.58 : 0.38) * auraFade,
            sizeLight: backdropSize,
            phase: Math.random() * Math.PI * 2,
            swarmDelay: (1 - v) * 0.13 + Math.random() * 0.09,
            arcX: (Math.random() - 0.5) * Math.min(250, stageW * 0.22),
            arcY: (Math.random() - 0.5) * 95,
          });
        }
      }

      particles = nextParticles;
      syncAboutImage(scrollProgress);
    };

    const drawStatic = () => {
      const isLight = isLightRef.current;
      ctx.clearRect(0, 0, stageW, stageH);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const r = isLight ? p.rLight : p.r;
        const g = isLight ? p.gLight : p.g;
        const b = isLight ? p.bLight : p.b;
        const alpha = isLight ? p.alphaLight : p.alpha;
        const size = isLight ? p.sizeLight : p.size;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.startX, p.startY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawStaticRef.current = prefersReduced ? drawStatic : null;

    const tick = (time: number) => {
      if (destroyed || particles.length === 0) return;

      // Lerp scrollProgress so discrete wheel notches become silky 60fps bi-directional motion
      const diff = targetScrollProgress - scrollProgress;
      scrollProgress = Math.abs(diff) < 0.0005 ? targetScrollProgress : scrollProgress + diff * 0.15;
      syncAboutImage(scrollProgress);

      ctx.clearRect(0, 0, stageW, stageH);

      const handoffFade = 1 - smoothstep(0.84, 0.99, scrollProgress);
      if (handoffFade <= 0.005) {
        // Keep particle coordinates synced to the About portrait so scroll-up erupts seamlessly
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x = p.endX;
          p.y = p.endY;
          p.vx = 0;
          p.vy = 0;
        }
        return;
      }

      const isLight = isLightRef.current;
      const radius = 130;
      const radiusSq = radius * radius;
      const spring = 0.095;
      const damping = 0.56;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const baseR = isLight ? p.rLight : p.r;
        const baseG = isLight ? p.gLight : p.g;
        const baseB = isLight ? p.bLight : p.b;
        const baseAlpha = isLight ? p.alphaLight : p.alpha;
        const baseSize = isLight ? p.sizeLight : p.size;

        const localP = Math.max(
          0,
          Math.min(1, (scrollProgress - p.swarmDelay) / 0.64),
        );
        const eased = localP * localP * (3 - 2 * localP);
        const arc = Math.sin(eased * Math.PI);

        // Subtle idle drift in Hero, tapering down cleanly as particles lock into About portrait
        const driftScale = 1 - eased * 0.9;
        const driftX = Math.sin(time * 0.8 + p.phase) * 0.55 * driftScale;
        const driftY = Math.cos(time * 0.7 + p.phase) * 0.55 * driftScale;

        const targetX = p.startX + (p.endX - p.startX) * eased + p.arcX * arc + driftX;
        const targetY = p.startY + (p.endY - p.startY) * eased + p.arcY * arc + driftY;

        let boost = 0;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / radius;
            const force = falloff * falloff;
            boost = falloff;

            const nx = dx / dist;
            const ny = dy / dist;
            const swirl = Math.sin(time * 1.8 + p.phase) * 0.25;

            p.vx += (nx - ny * swirl) * force * 7 + pointer.vx * force * 0.1;
            p.vy += (ny + nx * swirl) * force * 7 + pointer.vy * force * 0.1;
          }
        }

        p.vx += (targetX - p.x) * spring;
        p.vy += (targetY - p.y) * spring;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;

        const cropFade = p.inCrop ? 1 : Math.max(0, 1 - eased * 1.35);
        const flightAlpha = baseAlpha + (0.9 - baseAlpha) * arc * 0.6;
        const renderAlpha = Math.min(0.95, (flightAlpha + boost * 0.4) * handoffFade * cropFade);
        if (renderAlpha <= 0.01) continue;

        const renderSize = baseSize + boost * 1.35 + arc * 0.35;

        const r = Math.round(baseR + (96 - baseR) * boost * 0.35);
        const g = Math.round(baseG + (165 - baseG) * boost * 0.35);
        const b = Math.round(baseB + (250 - baseB) * boost * 0.45);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${renderAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2);
        ctx.fill();
      }

      pointer.vx *= 0.85;
      pointer.vy *= 0.85;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const nextX = e.clientX - rect.left;
      const nextY = e.clientY - rect.top;
      pointer.vx = pointer.active ? nextX - pointer.x : 0;
      pointer.vy = pointer.active ? nextY - pointer.y : 0;
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (destroyed) return;
      imageLoaded = img;
      buildParticles();
      ScrollTrigger.refresh();
      if (prefersReduced) {
        drawStatic();
      }
    };

    const fullImg = new window.Image();
    fullImg.src = fullSrc;
    fullImg.onload = () => {
      if (destroyed) return;
      fullImageLoaded = fullImg;
      if (imageLoaded) {
        buildParticles();
        if (prefersReduced) {
          drawStatic();
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!imageLoaded) return;
      buildParticles();
      ScrollTrigger.refresh();
      if (prefersReduced) {
        drawStatic();
      }
    });
    resizeObserver.observe(stage);

    let swarmTrigger: ScrollTrigger | null = null;

    if (!prefersReduced) {
      const aboutPortraitEl = stage.querySelector<HTMLElement>("[data-gsap-about-portrait='true']");
      swarmTrigger = ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        endTrigger: aboutPortraitEl ?? "#about",
        end: "center 55%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetScrollProgress = self.progress;
        },
        onRefresh: (self) => {
          targetScrollProgress = self.progress;
          scrollProgress = self.progress;
          syncAboutImage(scrollProgress);
        },
      });

      gsap.ticker.add(tick);
      stage.addEventListener("pointermove", handlePointerMove, { passive: true });
      stage.addEventListener("pointerleave", handlePointerLeave);
    } else {
      syncAboutImage(1);
    }

    return () => {
      destroyed = true;
      drawStaticRef.current = null;
      resizeObserver.disconnect();
      swarmTrigger?.kill();
      gsap.ticker.remove(tick);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [src, fullSrc]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-[2] h-full w-full", className)}
    />
  );
}
