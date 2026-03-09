---
title: "Universal UI with React Native, Next.js, and Astro: The Complete Guide"
description: "How to integrate React Native with different web frameworks like Next.js and Astro to share UI components across all of them."
createdAt: "2026-03-09T13:35:11Z"
publishedAt: "2026-03-09T13:35:11Z"
updatedAt: "2026-03-09T13:35:11Z"
tags: ["React Native", "Next.js", "Astro", "Web", "Universal UI"]
---
In this blog, we'll explore how to integrate React Native with different web frameworks — specifically Next.js and Astro — so that your application can share the same UI components across all of them. No rewrites, no duplicate logic, one component library that runs everywhere.

## 🎯 The Vision

I set out to build a universal, web-first application that I could later extend to Android and iOS — write the components once, run them everywhere. Two frameworks were on the table: React Native and Flutter. Flutter is impressive, but its web output compiles to WebAssembly, which wasn't the direction I wanted to go. React Native, on the other hand, has a rich ecosystem, a massive community, and — critically — `react-native-web`, which bridges native UI primitives directly to the browser as real DOM. That combination made it the clear choice.

For UI components, I'm a longtime fan of `shadcn/ui`, so I gravitated towards `react-native-reusables` (RNR) — a library built on shadcn primitives that was a joy to work with. But my use case demanded more: complex tables, rich filters, components from a handful of different libraries. Rather than spam the RNR repo or paint myself into a corner with a single design system, I decided to build my own custom component library, mixing and matching the best pieces from multiple sources.

The architecture felt clean. The vision was clear. Then I started writing code.

## 😤 The Styling Nightmare

I spun up a new project: Next.js, Fumadocs, Expo (`react-native-web`), and NativeWind for Tailwind bindings. Installation was surprisingly smooth. I added `react-native` and `react-native-web` to `transpilePackages`, along with a Webpack alias in `next.config.mjs` to redirect native imports to their web counterparts:

```javascript
// next.config.mjs
webpack: (config, { isServer }) => {
  config.resolve.alias['react-native'] = 'react-native-web';
  return config;
},
```

Here's the full `next.config.mjs` at that point:

```typescript
import { createMDX } from "fumadocs-mdx/next";
import { withExpo } from "@expo/next-adapter";
import { withUniwind } from "uniwind-plugin-next";
import { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@moe/registry",
    "expo",
    "react-native",
    "react-native-web",
    "lucide-react-native",
    "react-native-screens",
    "react-native-safe-area-context",
    "react-native-reanimated",
    "uniwind",
    "@expo/html-elements",
    "nativewind",

    // ALL @rn-primitives packages used in @moe/registry
    "@rn-primitives/accordion",
    "@rn-primitives/alert-dialog",
    "@rn-primitives/aspect-ratio",
    "@rn-primitives/avatar",
    "@rn-primitives/checkbox",
    "@rn-primitives/collapsible",
    "@rn-primitives/context-menu",
    "@rn-primitives/dialog",
    "@rn-primitives/dropdown-menu",
    "@rn-primitives/hover-card",
    "@rn-primitives/hooks",
    "@rn-primitives/label",
    "@rn-primitives/menubar",
    "@rn-primitives/popover",
    "@rn-primitives/portal",
    "@rn-primitives/progress",
    "@rn-primitives/radio-group",
    "@rn-primitives/select",
    "@rn-primitives/separator",
    "@rn-primitives/slot",
    "@rn-primitives/switch",
    "@rn-primitives/tabs",
    "@rn-primitives/toggle",
    "@rn-primitives/toggle-group",
    "@rn-primitives/tooltip",
    "@babel/core",
  ],
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['react-native'] = 'react-native-web';
    return config;
  },
};

const wrappedConfig = withUniwind(withMDX(withExpo(config)), {
  cssEntryFile: "./app/global.css",
  dtsFile: "./uniwind-types.d.ts",
});

export default wrappedConfig;
```

And just like that, React Native components rendered inside Next.js. A promising start.

Then I applied Tailwind classes to my components.

Nothing happened.

The components rendered fine, but every single Tailwind class was silently ignored. For weeks, I was deep in the mud: tweaking NativeWind configs, wrestling with Next.js settings, poking around Tailwind configuration, auditing Webpack. No solution materialized, so I went further — reading the actual source code of React Native Reusables, NativeWind, and the underlying Webpack plugins trying to understand what was breaking.

Around this time, I discovered a library called **Uniwind**. Thinking the issue was framework-specific, I decided to try a different host framework altogether. Astro caught my eye — it has first-class React support and its Island Architecture felt like a natural fit for a component-driven setup like mine. So I spun up a fresh Astro project and gave it a shot. Same result. React Native components rendered. Tailwind styles: completely ignored.

The Uniwind community provided a Next.js-compatible Webpack plugin. I tried it. It worked — partially — before collapsing with a cascade of `exports not found` errors for several components:

```
Runtime ReferenceError: exports is not defined

Call Stack (30)
(app-pages-browser)/../../node_modules/.pnpm/uniwind@1.5.0_react-native@0.83.1_@babel+core@7.29.0_
@types+react@19.2.14_react@19.2.4__react@19.2.4_tailwindcss@4.2.1/node_modules/uniwind/dist/
common/components/web/index.js
.next/dev/static/chunks/app/docs/layout.js (7657:1)

(app-pages-browser)/../../node_modules/.pnpm/@rn-primitives+hooks@1.3.0_react-native-web@0.21.2_
react-dom@19.2.4_react@19.2.4__react@19.2._z4xebelne4u5qx47hftvrkbhhe/node_modules/
@rn-primitives/hooks/dist/index.js
.next/dev/static/chunks/app/docs/layout.js (689:1)
```

I tried everything. Weeks of debugging. After burning through what felt like an unreasonable number of Claude tokens, I went back to the source: the Webpack plugins themselves. The root cause was subtle but devastating. These libraries redirect every `react-native` import to their own custom implementations. With the Uniwind Webpack plugin specifically, some of those component implementations simply don't exist — so when Webpack goes looking for them, there's no file to reference. That's where the `exports not found` errors were coming from.

## 💡 The Breakthrough: Vite & Astro

Re-reading the Uniwind documentation with fresh eyes, I spotted something I'd glossed over: Uniwind also ships a **Vite plugin**. Since Astro uses Vite under the hood, I decided to take the Webpack path entirely off the table and try Astro + Vite instead.

Voilà. Almost everything worked out of the box.

One last snag remained: when I introduced custom CSS variables, `lightningcss` (Vite's CSS processor) failed to parse the theme variables correctly, throwing cryptic errors. After more digging, I found a specific working version of `lightningcss`, installed it locally, and forced an override in `package.json`:

```json
"pnpm": {
  "overrides": {
    "lightningcss": "~1.29.3"
  }
}
```

Then it all clicked. Styles applied. Components rendered perfectly. The POC was alive.

## 🧱 The Stack That Finally Worked

Here's what the architecture looked like after all the dust settled:

- **React Native / React Native Web** — the core UI primitives. `<View>`, `<Text>`, `<Image>` instead of `<div>` and `<span>`, running identically on iOS, Android, and the web.
- **Astro.js** — the web layer. Zero JavaScript by default, Vite under the hood, and Island Architecture for opting into interactivity exactly where you need it.
- **Uniwind** — the styling glue. Standard Tailwind utility classes that work seamlessly across native mobile and the web, via Vite.

## 🔧 Building a Universal Component

Here's what a component looks like in practice. Thanks to Uniwind, you use standard Tailwind classes directly on React Native primitives — and this single file renders correctly on iOS, Android, *and* in the browser:

```tsx
// src/components/UniversalCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const UniversalCard = () => {
  return (
    <View className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <Text className="text-xl font-bold text-gray-900 mb-2">
        Universal Component
      </Text>
      <Text className="text-gray-600 mb-4">
        This card is built using React Native primitives and styled with Uniwind.
      </Text>
      <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg items-center">
        <Text className="text-white font-medium">Click Me</Text>
      </TouchableOpacity>
    </View>
  );
};
```

Dropping it into an Astro page is equally straightforward:

```astro
---
// index.astro
import { UniversalCard } from '../components/UniversalCard';
---

<html lang="en">
  <head><title>Universal UI</title></head>
  <body class="bg-gray-50 flex items-center justify-center min-h-screen">
    
    <!-- Static render — zero JS shipped to the browser -->
    <UniversalCard />
    
    <!-- Or hydrate interactivity on demand -->
    <!-- <UniversalCard client:load /> -->

  </body>
</html>
```

Astro's Island Architecture means you get static rendering for free, and you opt into JavaScript only for the parts that actually need it — perfect for a button press or an animation.

## ⚙️ The Configuration That Makes It All Work

Getting Vite to bundle React Native components for the web requires a few very specific tweaks in `astro.config.mjs`:

```javascript
// astro.config.mjs
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { rnw } from "vite-plugin-rnw";
import { uniwind } from "uniwind/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [
    starlight({ /* ... */ }),
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        "react-native": "react-native-web", // 1. The Essential Alias
      },
    },
    ssr: {
      noExternal: ["react-native", "react-native-web", "uniwind"], // 2. Prevent SSR Crashes
    },
    css: {
      lightningcss: {},
    },
    plugins: [
      ...rnw().filter((plugin) => !Array.isArray(plugin)), // 3. Plugin Collision Fix

      tailwindcss(),

      uniwind({
        cssEntryFile: "src/styles/global.css",
        dtsFile: "./uniwind-types.d.ts",
      }),
    ],
  },
  adapter: cloudflare(),
});
```

Each piece of this config earned its place the hard way:

- **The Essential Alias** — Without this, every `import ... from 'react-native'` fails on the web. This single line tells Vite to transparently swap it for `react-native-web` at build time.
- **Preventing SSR Crashes (`noExternal`)** — Astro renders pages on the server by default. Node.js will try to execute packages that expect a browser environment and promptly crash. Adding them to `noExternal` forces Vite to bundle and process these dependencies correctly during SSR rather than leaving them as raw external imports.
- **The Plugin Collision Fix** — `vite-plugin-rnw` tries to register the React plugin internally, but Astro's `react()` integration already does this. The collision causes Vite to throw errors. Filtering out array entries from the `rnw()` plugin array prevents the double registration.

## 🏁 Conclusion

What started as a straightforward idea — one component library, every platform — turned into a deep dive through Webpack internals, silent Tailwind failures, and cascading exports not defined errors. The culprit wasn't React Native, and it wasn't the component libraries. It was Webpack's inability to correctly handle the module resolution and plugin composition that NativeWind and Uniwind depend on.

The fix came from stepping off the Webpack path entirely. Switching to Astro + Vite resolved most issues instantly, and a pinned lightningcss version cleared the final hurdle. The result: a fully working POC where a single React Native component — styled with standard Tailwind classes via Uniwind — renders correctly on iOS, Android, and the web without a single line rewritten.

If you're building a universal component library and hitting the same walls, the TLDR is: skip Next.js for now, reach for Astro, use the Vite plugin, and pin your lightningcss version.

## 🔬 Final Verdict & What's Next

The Astro + Vite path works, and the POC is live — you can see it here: [astor-expo.saurabhmalvia997.workers.dev](https://astor-expo.saurabhmalvia997.workers.dev)

But I'm not done yet.

I'm still heavily invested in understanding the Webpack side of this problem. The dream is proper, first-class support for both NativeWind and Uniwind on Webpack — which would unblock Next.js and make this setup accessible to the majority of React Native Web projects that haven't moved to Vite. Getting there requires a much deeper understanding of how these bundlers handle module resolution, alias chains, and plugin composition.

So the research continues. If you've dug into this space or have thoughts on how Webpack could properly support NativeWind or Uniwind, I'd genuinely love to connect.
