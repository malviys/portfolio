"use client";

import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useTheme } from "next-themes";

gsap.registerPlugin(InertiaPlugin);

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

interface AutoMotionState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  lastTime: number;
  nextTargetAt: number;
  warmupUntil: number;
  cols: number;
  rows: number;
  visits: number[];
  driftPhaseX: number;
  driftPhaseY: number;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  baseColorDark?: string;
  baseColorLight?: string;
  activeColor?: string;
  activeColorDark?: string;
  activeColorLight?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  idleTimeoutMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
    a: m[4] ? parseInt(m[4], 16) / 255 : 1,
  };
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 16,
  gap = 32,
  baseColor,
  baseColorDark = "#271E3711",
  baseColorLight = "#00000015",
  activeColor,
  activeColorDark = "#5227FF",
  activeColorLight = "#5227FF",
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  idleTimeoutMs = 2500,
  className = "",
  style,
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentBaseColor = !mounted
    ? baseColor || baseColorDark
    : resolvedTheme === "light"
      ? baseColorLight || baseColor || "#00000015"
      : baseColorDark || baseColor || "#271E3711";

  const currentActiveColor = !mounted
    ? activeColor || activeColorDark
    : resolvedTheme === "light"
      ? activeColorLight || activeColor || "#5227FF"
      : activeColorDark || activeColor || "#5227FF";

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRafRef = useRef<number | null>(null);
  const autoMotionRef = useRef<AutoMotionState | null>(null);

  const baseRgb = useMemo(() => hexToRgb(currentBaseColor), [currentBaseColor]);
  const activeRgb = useMemo(() => hexToRgb(currentActiveColor), [currentActiveColor]);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;

    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) return;

    let rafId: number;
    const proxSq = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let style = currentBaseColor;
        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          const a = baseRgb.a + (activeRgb.a - baseRgb.a) * t;
          style = `rgba(${r},${g},${b},${a})`;
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = style;
        ctx.fill(circlePath);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [proximity, currentBaseColor, activeRgb, baseRgb, circlePath]);

  useEffect(() => {
    buildGrid();
    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(buildGrid);
      wrapperRef.current && ro.observe(wrapperRef.current);
    } else {
      (window as Window).addEventListener("resize", buildGrid);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", buildGrid);
    };
  }, [buildGrid]);

  useEffect(() => {
    const applyPointerUpdate = (clientX: number, clientY: number, now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? Math.max(1, now - pr.lastTime) : 16;
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const dx = localX - pr.lastX;
      const dy = localY - pr.lastY;

      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }

      pr.lastTime = now;
      pr.lastX = localX;
      pr.lastY = localY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;
      pr.x = localX;
      pr.y = localY;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed > speedTrigger && dist < proximity && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const pushX = dot.cx - pr.x + vx * 0.005;
          const pushY = dot.cy - pr.y + vy * 0.005;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1,0.75)",
              });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const stopAutoMotion = () => {
      if (autoRafRef.current !== null) {
        cancelAnimationFrame(autoRafRef.current);
        autoRafRef.current = null;
      }
    };

    const getVisitIndex = (col: number, row: number, cols: number) => row * cols + col;

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const ensureAutoState = (rect: DOMRect) => {
      const cellSize = Math.max(100, Math.min(180, proximity * 0.9));
      const cols = Math.max(2, Math.floor(rect.width / cellSize));
      const rows = Math.max(2, Math.floor(rect.height / cellSize));
      const now = performance.now();

      if (!autoMotionRef.current) {
        autoMotionRef.current = {
          x: rect.width * 0.5,
          y: rect.height * 0.5,
          vx: 0,
          vy: 0,
          targetX: rect.width * 0.5,
          targetY: rect.height * 0.5,
          lastTime: now,
          nextTargetAt: now,
          warmupUntil: now,
          cols,
          rows,
          visits: new Array(cols * rows).fill(0),
          driftPhaseX: Math.random() * Math.PI * 2,
          driftPhaseY: Math.random() * Math.PI * 2,
        };
        return autoMotionRef.current;
      }

      if (autoMotionRef.current.cols !== cols || autoMotionRef.current.rows !== rows) {
        autoMotionRef.current.cols = cols;
        autoMotionRef.current.rows = rows;
        autoMotionRef.current.visits = new Array(cols * rows).fill(0);
      }

      return autoMotionRef.current;
    };

    const chooseNextTarget = (state: AutoMotionState, rect: DOMRect, now: number) => {
      let minVisit = Number.POSITIVE_INFINITY;
      for (const visit of state.visits) {
        if (visit < minVisit) minVisit = visit;
      }

      const candidateThreshold = minVisit + 1;
      const candidates: Array<{ x: number; y: number; dist: number; visit: number }> = [];
      for (let row = 0; row < state.rows; row++) {
        for (let col = 0; col < state.cols; col++) {
          const idx = getVisitIndex(col, row, state.cols);
          const visit = state.visits[idx];
          if (visit > candidateThreshold) continue;

          const cellW = rect.width / state.cols;
          const cellH = rect.height / state.rows;
          const x = col * cellW + cellW * (0.2 + Math.random() * 0.6);
          const y = row * cellH + cellH * (0.2 + Math.random() * 0.6);
          const dist = Math.hypot(x - state.x, y - state.y);
          candidates.push({ x, y, dist, visit });
        }
      }

      if (candidates.length === 0) return;

      candidates.sort((a, b) => {
        if (a.visit !== b.visit) return a.visit - b.visit;
        return b.dist - a.dist;
      });

      const topN = Math.min(6, candidates.length);
      const pick = candidates[Math.floor(Math.random() * topN)];
      state.targetX = pick.x;
      state.targetY = pick.y;
      state.nextTargetAt = now + 900 + Math.random() * 1300;
    };

    const runAutoMotion = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const now = performance.now();
      const state = ensureAutoState(rect);
      const dt = clamp((now - state.lastTime) / 1000, 0.001, 0.05);
      state.lastTime = now;

      const cellW = rect.width / state.cols;
      const cellH = rect.height / state.rows;
      const col = clamp(Math.floor(state.x / cellW), 0, state.cols - 1);
      const row = clamp(Math.floor(state.y / cellH), 0, state.rows - 1);
      state.visits[getVisitIndex(col, row, state.cols)] += 1;

      const distToTarget = Math.hypot(state.targetX - state.x, state.targetY - state.y);
      if (now >= state.warmupUntil && (distToTarget < 30 || now >= state.nextTargetAt)) {
        chooseNextTarget(state, rect, now);
      }

      const toTargetX = state.targetX - state.x;
      const toTargetY = state.targetY - state.y;
      const targetDist = Math.max(1, Math.hypot(toTargetX, toTargetY));

      let desiredSpeed = clamp(170 + targetDist * 0.55, 120, 420);
      if (targetDist < 180) {
        desiredSpeed *= 0.35 + (targetDist / 180) * 0.65;
      }

      const desiredVx = (toTargetX / targetDist) * desiredSpeed;
      const desiredVy = (toTargetY / targetDist) * desiredSpeed;

      const driftX = Math.sin(now * 0.0011 + state.driftPhaseX) * 26 + Math.sin(now * 0.00037) * 10;
      const driftY = Math.cos(now * 0.0013 + state.driftPhaseY) * 24 + Math.cos(now * 0.00041) * 10;

      const accel = 3.6;
      state.vx += (desiredVx - state.vx) * accel * dt + driftX * dt;
      state.vy += (desiredVy - state.vy) * accel * dt + driftY * dt;

      const speed = Math.hypot(state.vx, state.vy);
      const maxAutoSpeed = 460;
      if (speed > maxAutoSpeed) {
        const scale = maxAutoSpeed / speed;
        state.vx *= scale;
        state.vy *= scale;
      }

      state.x += state.vx * dt;
      state.y += state.vy * dt;

      const margin = 8;
      if (state.x < margin) {
        state.x = margin;
        state.vx = Math.abs(state.vx) * 0.4;
        state.nextTargetAt = 0;
      } else if (state.x > rect.width - margin) {
        state.x = rect.width - margin;
        state.vx = -Math.abs(state.vx) * 0.4;
        state.nextTargetAt = 0;
      }
      if (state.y < margin) {
        state.y = margin;
        state.vy = Math.abs(state.vy) * 0.4;
        state.nextTargetAt = 0;
      } else if (state.y > rect.height - margin) {
        state.y = rect.height - margin;
        state.vy = -Math.abs(state.vy) * 0.4;
        state.nextTargetAt = 0;
      }

      applyPointerUpdate(rect.left + state.x, rect.top + state.y, now);
      autoRafRef.current = requestAnimationFrame(runAutoMotion);
    };

    const startAutoMotion = () => {
      if (autoRafRef.current !== null) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const now = performance.now();
        const state = ensureAutoState(rect);
        state.x = clamp(pointerRef.current.x || rect.width * 0.5, 0, rect.width);
        state.y = clamp(pointerRef.current.y || rect.height * 0.5, 0, rect.height);

        // Launch autoplay with a fully random initial direction.
        const launchAngle = Math.random() * Math.PI * 2;
        const launchSpeed = 130 + Math.random() * 180;
        const launchVx = Math.cos(launchAngle) * launchSpeed;
        const launchVy = Math.sin(launchAngle) * launchSpeed;
        state.vx = launchVx;
        state.vy = launchVy;

        const launchDistance = 180 + Math.random() * 180;
        state.targetX = clamp(state.x + Math.cos(launchAngle) * launchDistance, 8, rect.width - 8);
        state.targetY = clamp(state.y + Math.sin(launchAngle) * launchDistance, 8, rect.height - 8);
        state.lastTime = now;
        state.warmupUntil = now + 800;
        state.nextTargetAt = state.warmupUntil;
      }
      runAutoMotion();
    };

    const resetIdleTimer = () => {
      stopAutoMotion();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(startAutoMotion, idleTimeoutMs);
    };

    const onMove = (e: MouseEvent) => {
      resetIdleTimer();
      applyPointerUpdate(e.clientX, e.clientY, performance.now());
    };

    const onClick = (e: MouseEvent) => {
      resetIdleTimer();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - cx) * shockStrength * falloff;
          const pushY = (dot.cy - cy) * shockStrength * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: "elastic.out(1,0.75)",
              });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const throttledMove = throttle(onMove, 50);
    const onUserActivity = () => resetIdleTimer();

    resetIdleTimer();
    window.addEventListener("mousemove", throttledMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("touchstart", onUserActivity, { passive: true });
    window.addEventListener("pointerdown", onUserActivity, { passive: true });
    window.addEventListener("keydown", onUserActivity);
    window.addEventListener("scroll", onUserActivity, { passive: true });

    return () => {
      stopAutoMotion();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", throttledMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchstart", onUserActivity);
      window.removeEventListener("pointerdown", onUserActivity);
      window.removeEventListener("keydown", onUserActivity);
      window.removeEventListener("scroll", onUserActivity);
    };
  }, [idleTimeoutMs, maxSpeed, speedTrigger, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  return (
    <section className={`p-4 flex items-center justify-center h-full w-full relative ${className}`} style={style}>
      <div ref={wrapperRef} className="w-full h-full relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>
    </section>
  );
};

export default DotGrid;
