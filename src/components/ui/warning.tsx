"use client";

import { useEffect } from "react";

export type ConsoleWarningProps = {
  message: string;
};

export function ConsoleWarning({ message }: Readonly<ConsoleWarningProps>) {
  useEffect(() => {
    console.warn(`%c${message}`, "color: orange; font-size: x-large");
  }, [message]);

  return null;
}
