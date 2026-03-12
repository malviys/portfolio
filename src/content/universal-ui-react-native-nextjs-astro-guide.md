---
title: "Universal UI with React Native, Next.js, and Astro: The Complete Guide"
description: "How to integrate React Native with different web frameworks like Next.js and Astro to share UI components across all of them."
createdAt: "2026-03-09T13:35:11Z"
publishedAt: "2026-03-09T13:35:11Z"
updatedAt: "2026-03-09T13:35:11Z"
tags: ["React Native", "Next.js", "Astro", "Web", "Universal UI"]
---

In this blog, we'll walk through how to integrate React Native with Next.js and Astro. Once the setup is in place, you can reuse the same components across any of these frameworks — whether that's a component documentation site, a Storybook, a marketing landing page, or any other web surface — without rewriting a single thing.

---

## 🎯 The Vision

I set out to build a universal, web-first application that I could later extend to Android and iOS — write the components once, run them everywhere. Two frameworks were on the table: React Native and Flutter. Flutter is impressive, but its web output compiles to WebAssembly, which wasn't the direction I wanted to go. React Native, on the other hand, has a rich ecosystem, a massive community, and — critically — `react-native-web`, which bridges native UI primitives directly to the browser as real DOM. That combination made it the clear choice.

For UI components, I'm a longtime fan of `shadcn/ui`, so I gravitated towards `react-native-reusables` (RNR) — a library built on shadcn primitives that was a joy to work with. But my use case demanded more: complex tables, rich filters, components from a handful of different libraries. Rather than spam the RNR repo or paint myself into a corner with a single design system, I decided to build my own custom component library, mixing and matching the best pieces from multiple sources.

The architecture felt clean. The vision was clear. Then I started writing code.

---

## 📖 Background

I spun up a new project: Next.js, Fumadocs, Expo (`react-native-web`), and NativeWind for Tailwind bindings. Getting React Native components to render inside Next.js was straightforward — add `react-native` and `react-native-web` to `transpilePackages`, add the Webpack alias, wrap everything in `withExpo`, and things just worked.

Then I applied Tailwind classes to my components.

**Nothing happened.**

The components rendered fine, but every single Tailwind class was silently ignored. For weeks, I was deep in the mud: tweaking NativeWind configs, wrestling with Next.js settings, auditing Webpack. No solution materialized, so I went further — reading the actual source code of React Native Reusables, NativeWind, and the underlying Webpack plugins trying to understand what was breaking.

Around this time, I discovered **Uniwind**. Thinking the issue was framework-specific, I tried a fresh Astro project. Same result. Components rendered. Tailwind styles: completely ignored.

The Uniwind community provides a Next.js-compatible Webpack plugin. I tried it. It worked partially, before collapsing with a cascade of `exports not found` errors:

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

After digging into the Webpack plugins themselves, the root cause became clear. These libraries redirect every `react-native` import to their own custom implementations. With the Uniwind Webpack plugin specifically, some of those implementations simply don't exist — so when Webpack goes looking for them, there's no file to reference. That's where the `exports not found` errors come from, and it's why the Next.js path breaks when using `@rn-primitives`.

The breakthrough came from re-reading the Uniwind docs with fresh eyes: Uniwind also ships a **Vite plugin**. Since Astro uses Vite under the hood, switching to Astro + Vite resolved almost everything instantly. One last snag — custom CSS variables caused `lightningcss` to throw cryptic parsing errors — was cleared by pinning the `lightningcss` version (see Monorepo Support below). Then it all clicked. ✅

The setup sections below document exactly what that working configuration looks like.

---

## ⚡️ Quick Setup

<tabs defaultValue="nextjs" groupId="framework">
 <tabslist>
  <tabstrigger value="nextjs">Next.js</tabstrigger>
  <tabstrigger value="astro">Astro.js</tabstrigger>
 </tabslist>
 <tabscontent value="nextjs">
  To get started with Next.js, you'll need to set up `react-native-web` and configure Next.js to alias React Native imports appropriately. Make sure you install the necessary UI primitives.

  Install dependencies

  ```bash
  npm install react-native-web react-native expo @expo/next-adapter
  ```

  Configure Babel for Expo transforms

  ```typescript
  // babel.config.js
  module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
    };
  };
  ```

  Configure Next.js to transform language features

  ```typescript
  // next.config.js|mjs|ts
  import { withExpo } from '@expo/next-adapter';

  /** @type {import('next').NextConfig} */
  const nextConfig = withExpo({
    reactStrictMode: true,
    swcMinify: true,
    transpilePackages: [
      'react-native',
      'react-native-web',
      'expo',
      // Add more React Native/Expo packages here...
    ],
    experimental: {
      forceSwcTransforms: true,
    },
  });

  export default nextConfig;
  ```

  Test it — render a React Native component

  ```tsx
  'use client';

  import { Text } from 'react-native';

  export default function TextPreview() {
    return <Text>Hello, world!</Text>;
  }
  ```

 </tabscontent>
 <tabscontent value="astro">
  For Astro, the setup revolves around configuring Vite properly since Astro utilizes it under the hood. You'll need to set up the aliasing and ensure SSR doesn't clash with React Native modules.

  Install Astro integrations and dependencies

  ```bash
  npx astro add react
  npm install react-native-web react-native
  ```

  Configure Astro

  ```typescript
  // astro.config.ts|mjs
  import react from "@astrojs/react";
  import { defineConfig } from "astro/config";

  export default defineConfig({
    integrations: [
      react(),
    ],
    vite: {
      resolve: {
        alias: {
          "react-native": "react-native-web",
        },
      },
      ssr: {
        noExternal: ["react-native", "react-native-web"],
      },
      css: {
        lightningcss: {},
      },
      plugins: [],
    },
  });
  ```

  Create a universal component

  ```tsx
  import { Text } from 'react-native';

  export default function TextPreview() {
    return <Text>Hello, world!</Text>;
  }
  ```

  Use it in an Astro page

  ```astro
  ---
  import TextPreview from '../components/TextPreview';
  ---

  <TextPreview client:only="react"/>
  ```

 </tabscontent>
</tabs>

---

## Adding Tailwind

After rendering, let's add Tailwind support.

<tabs defaultValue="nextjs" groupId="framework">
 <tabslist>
  <tabstrigger value="nextjs">Next.js</tabstrigger>
  <tabstrigger value="astro">Astro.js</tabstrigger>
 </tabslist>
 <tabscontent value="nextjs">
  Next.js uses Webpack (or Turbopack) as its bundler, while Uniwind is architected around Metro's transformer pipeline. These are fundamentally different build systems with different APIs and plugin architectures. To resolve this, `@a16n-dev` has created `uniwind-plugin-next`, a Webpack plugin that integrates Uniwind into Next.js applications with SSR support.

  Install dependencies

  ```bash
  npm install tailwindcss uniwind uniwind-plugin-next @expo/next-adapter
  ```

  Configure Next.js

  ```typescript
  // next.config.js|mjs|ts
  import { withExpo } from '@expo/next-adapter';
  import { withUniwind } from 'uniwind-plugin-next';

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    transpilePackages: [
      'react-native',
      'react-native-web',
      'expo',
      // Add more React Native/Expo packages here...
    ],
    experimental: {
      forceSwcTransforms: true,
    },
  };

  const expoConfig = withExpo(nextConfig);

  const uniwindConfig = withUniwind(expoConfig, {
    cssEntryFile: './app/globals.css',
  });

  export default uniwindConfig;
  ```

  Add the postcss plugin

  ```typescript
  // postcss.config.js|mjs|ts
  const config = {
    plugins: {
      'uniwind-plugin-next/postcss': {}, // Add this line
      '@tailwindcss/postcss': {},
    },
  };
  ```

  Add `@import 'uniwind'` to your global CSS file

  ```css
  /* global.css */
  @import "tailwindcss";
  @import "uniwind";
  ```

  Add `suppressHydrationWarning` to the root `<html>` tag

  ```tsx
  // app/layout.tsx
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    );
  }
  ```

  Test it — render a styled React Native component

  ```tsx
  'use client';

  import { Text } from 'react-native';

  export default function TextPreview() {
    return <Text className="text-red-500">Hello, world!</Text>;
  }
  ```

 </tabscontent>
 <tabscontent value="astro">
  For Astro, Tailwind and Uniwind plug in cleanly via Vite.

  Install dependencies

  ```bash
  npx astro add tailwindcss
  npm install uniwind vite-plugin-rnw
  ```

  Configure Astro

  ```typescript
  // astro.config.ts|mjs
  import react from "@astrojs/react";
  import { defineConfig } from "astro/config";
  import { uniwind } from 'uniwind/vite';
  import { rnw } from 'vite-plugin-rnw';
  import tailwindcss from "@tailwindcss/vite";

  export default defineConfig({
    integrations: [
      react(),
    ],
    vite: {
      resolve: {
        alias: {
          "react-native": "react-native-web",
        },
      },
      ssr: {
        noExternal: ["react-native", "react-native-web", "uniwind"],
      },
      css: {
        lightningcss: {},
      },
      plugins: [
        ...rnw().filter(plugin => !Array.isArray(plugin)), // prevents React plugin being registered twice
        tailwindcss(),
        uniwind({
          cssEntryFile: './src/global.css',
          dtsFile: './src/uniwind-types.d.ts',
        }),
      ],
    },
  });
  ```

  Add `@import 'uniwind'` to your global CSS file

  ```css
  /* global.css */
  @import "tailwindcss";
  @import "uniwind";
  ```

  Test it — render a styled React Native component

  ```tsx
  import { Text } from 'react-native';

  export default function TextPreview() {
    return <Text className="text-red-500">Hello, world!</Text>;
  }
  ```

  Use it in an Astro page

  ```astro
  ---
  import TextPreview from '../components/TextPreview';
  ---

  <TextPreview client:only="react"/>
  ```

 </tabscontent>
</tabs>

---

## Why Uniwind?

I tried NativeWind first, but NativeWind's Tailwind v4 support is still in early preview and styles simply don't render reliably. Uniwind solved that — it provides a working Vite plugin and a Webpack plugin (with caveats), and Tailwind classes apply correctly when the setup is right.

---

## Monorepo Support

If you're working in a monorepo, you'll need two additional tweaks.

Override `lightningcss` to a version that parses CSS theme variables correctly:

```json
// package.json
"pnpm": {
  "overrides": {
    "lightningcss": "~1.29.3"
  }
}
```

Add a `@source` directive pointing to your shared packages so Tailwind scans them for class usage:

```css
/* global.css */
@import "tailwindcss";
@import "uniwind";

/* Path to your shared UI package in a monorepo */
@source "../packages";
```

---

## Known Issues

Since I'm using `react-native-reusables`, which under the hood uses `@rn-primitives`, the Next.js config with the Uniwind community plugin throws `exports not found` errors — the same error detailed in the Background section above. If you're using a different UI library that doesn't rely on `@rn-primitives`, you may not hit this. For now, my project runs on Astro where everything works smoothly.

I'm still exploring the Uniwind + Next.js integration and will update this section once there's a resolution.

---

## 🔧 A More Complete Component Example

The setup tabs show the minimal case — a `Text` component with a class. Here's what a real, composed universal component looks like. This exact file renders on iOS, Android, *and* the web without modification:

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

`<View>`, `<Text>`, `<TouchableOpacity>` — all React Native primitives, all styled with standard Tailwind classes. No platform-specific code anywhere.

---

## 🏁 Conclusion

Getting React Native components to render on the web is the easy part — the setup for both Next.js and Astro gets you there in minutes. The hard part is Tailwind styling, and whether it works depends entirely on which bundler you're running.
If you're on Astro + Vite, the Uniwind Vite plugin handles it cleanly. If you're on Next.js + Webpack, you'll hit module resolution conflicts that are difficult to work around, especially if your component library depends on @rn-primitives. That's not a limitation of React Native or Uniwind — it's a Webpack problem, and one I'm still actively digging into.
For now, the Astro path is the one that works end-to-end. Follow the setup tabs above, pin your lightningcss version if you're in a monorepo, and you'll have a single component library rendering correctly across iOS, Android, and the web.

---

## 🔬 Final Verdict & What's Next

The POC is live — see it here: **[astor-expo.saurabhmalvia997.workers.dev](https://astor-expo.saurabhmalvia997.workers.dev/)**

The Astro + Vite path works well enough to build on. But the Next.js story is unfinished, and that matters — most React Native Web projects are on Webpack, and they deserve a clean path too.
I'm still deep in the Webpack side of this: understanding how module resolution, alias chains, and plugin composition interact, and whether there's a way to give NativeWind and Uniwind proper first-class support without the workarounds. It's unsolved for now, but that's where the research is headed.
If you've hit these same walls, or have thoughts on how to make Webpack play nicely with either library, I'd genuinely love to hear from you. 🙌
