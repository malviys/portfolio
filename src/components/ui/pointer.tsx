"use client";

import { useContext, useRef } from "react";

import { ConfigContext } from "@/components/system/config-provider";

type PointerProps = { x: number; y: number };

export function Pointer({ x, y }: Readonly<PointerProps>) {
  const ref = useRef<HTMLElement>(null);
  const { interactiveElements } = useContext(ConfigContext);

  let size = !(x || y) ? { h: "h-0", w: "w-0" } : { h: "h-80", w: "w-80" };

  for (const element of interactiveElements) {
    const elRects = element.getClientRects().item(0);

    if (elRects) {
      const { left: ex, top: ey, width: ew, height: eh } = elRects;

      const cx = ex + ew / 2;
      const cy = ey + eh / 2;
      const rx = ew / 2; // radius in x-axis
      const ry = eh / 2; // radius in y-axis
      const d = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));

      if (d < rx || d < ry) {
        size = { h: "h-0", w: "w-0" };
        break;
      }
    }
  }

  const { h, w } = size;

  return (
    <span
      ref={ref}
      id="pointer"
      className={`fixed z-50 rounded-full bg-background mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-[height,width] duration-500 ${h} ${w}`}
      style={{ left: x, top: y }}
    />
  );
}
