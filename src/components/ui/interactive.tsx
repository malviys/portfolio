"use client";

import { cloneElement, ReactElement, useContext, useEffect, useId, useRef } from "react";

import { ConfigContext } from "@/components/system/config-provider";

type InteractiveProps = Readonly<{ children: ReactElement }>;

export default function Interactive({ children }: InteractiveProps) {
  const { addInteractiveElements, removeInteractiveElements } = useContext(ConfigContext);
  const ref = useRef<HTMLElement>();
  const id = 'interactive_' + useId();

  useEffect(() => {
    const { current } = ref;

    if (current) {
      addInteractiveElements(current);
    }

    return () => {
      if (current) {
        removeInteractiveElements(current);
      }
    };
  }, [addInteractiveElements, removeInteractiveElements]);

  return cloneElement(children, { id, ref });
}
