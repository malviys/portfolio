"use client";

import { useMemo, useState } from "react";

type Platform = "android" | "ios";

const platformMap: Record<Platform, { label: string; href?: string; note: string }> = {
  android: {
    label: "Android APK",
    href: "/downloads/lyd-android.apk",
    note: "Direct APK download",
  },
  ios: {
    label: "iOS",
    note: "Coming soon (TestFlight build not published yet)",
  },
};

export function PlatformDownload() {
  const [platform, setPlatform] = useState<Platform>("android");
  const selected = useMemo(() => platformMap[platform], [platform]);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="platform-select">
        Select platform
      </label>
      <select
        id="platform-select"
        value={platform}
        onChange={(event) => setPlatform(event.target.value as Platform)}
        className="h-11 rounded-xl border border-border/70 bg-background px-3 text-sm"
      >
        <option value="android">Android</option>
        <option value="ios">iOS</option>
      </select>

      {selected.href ? (
        <a
          href={selected.href}
          download
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Download {selected.label}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex h-11 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground/70"
        >
          iOS Coming Soon
        </button>
      )}

      <p className="text-xs text-muted-foreground sm:ml-2">{selected.note}</p>
    </div>
  );
}
