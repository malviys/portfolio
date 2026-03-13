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

For UI components, I'm a longtime fan of `shadcn/ui`, so I gravitated towards `react-native-reusables` (RNR) — a library built on shadcn primitives that was a joy to work with. But my use case demanded more: complex tables, rich filters, components from a handful of different libraries. Rather than paint myself into a corner with a single design system, I built my own custom component library, mixing and matching the best pieces from multiple sources.

The plan was to document and showcase these components on the web — using **Fumadocs** with Next.js and **Starlight** with Astro. The architecture felt clean. Then I started writing code.

---

## 📖 Background

React Native components work perfectly in the browser when you're using `react-native-web` with Metro as your bundler — that's the standard Expo web setup and it works well out of the box.

But my use case was different. I wanted to render these same components inside **Next.js** (specifically for a Fumadocs documentation site) and **Astro** (for Starlight). Neither of these frameworks uses Metro — Next.js runs on Webpack, Astro runs on Vite — and there's no straightforward, documented solution for making React Native components work with Tailwind styling in either of them. This guide is the result of figuring that out the hard way.

Getting components to *render* turned out to be the easy part — `react-native-web` handles that well in both frameworks. The hard part was **Tailwind styling**.

With Next.js + Webpack, every Tailwind class applied to a React Native primitive was silently ignored. Weeks of debugging eventually pointed to the root cause: the Webpack plugins used by NativeWind and Uniwind redirect `react-native` imports to their own custom implementations, and some of those implementations simply don't exist in the Webpack context — which is where the `exports not found` errors come from.

```
Runtime ReferenceError: exports is not defined
...
```

The fix came from switching bundlers entirely. Uniwind ships a Vite plugin, and Astro uses Vite under the hood — that combination resolved the styling issues cleanly. The setup sections below are based on that working configuration.

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

## 🎨 Adding Tailwind

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

## 🤔 Why Uniwind?

I tried NativeWind first, but NativeWind's Tailwind v4 support is still in early preview and styles simply don't render reliably. Uniwind solved that — it provides a working Vite plugin and a Webpack plugin (with caveats), and Tailwind classes apply correctly when the setup is right.

---

## 🗂️ Monorepo Support

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

## ⚠️ Known Issues

Since I'm using `react-native-reusables`, which under the hood uses `@rn-primitives`, the Next.js config with the Uniwind community plugin throws `exports not found` errors — the same error detailed in the Background section above. If you're using a different UI library that doesn't rely on `@rn-primitives`, you may not hit this. For now, my project runs on Astro where everything works smoothly.

I'm still exploring the Uniwind + Next.js integration and will update this section once there's a resolution.

---

## 🧩 A More Complete Component Example

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

The POC is live — see it here: **<a href="https://astor-expo.saurabhmalvia997.workers.dev/" target="_blank">AstroExpo</a>**

The Astro + Vite path works well enough to build on. But the Next.js story is unfinished, and that matters — most React Native Web projects are on Webpack, and they deserve a clean path too.
I'm still deep in the Webpack side of this: understanding how module resolution, alias chains, and plugin composition interact, and whether there's a way to give NativeWind and Uniwind proper first-class support without the workarounds. It's unsolved for now, but that's where the research is headed.
If you've hit these same walls, or have thoughts on how to make Webpack play nicely with either library, I'd genuinely love to hear from you. 🙌
