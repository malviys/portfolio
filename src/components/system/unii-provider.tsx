"use client";

import { useMemo, type ReactNode } from "react";
import { UniiClient } from "@unii/sdk";
import { UniiProvider } from "@unii/react";

interface UniiClientProviderProps {
  children: ReactNode;
}

export function UniiClientProvider({ children }: Readonly<UniiClientProviderProps>) {
  const client = useMemo(() => {
    return new UniiClient({
      baseUrl: (typeof window !== "undefined"
          ? window.location.origin : "http://localhost:3000"
      ) + "/api/ai",
      apiKey: "session-proxy",
      // Ensure browser sends authentication cookies to your BFF
      fetch: (url, init) => {
        return fetch(url, {
          ...init,
          credentials: "include" // Passes your app's session cookie
        });
      }
    });
  }, []);

  return (
    <UniiProvider client={client} stream={true}>
      {children}
    </UniiProvider>
  );
}
