export type ProjectStatus = "live" | "development";

export type PortfolioProject = {
  title: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  href?: string;
  githubUrl?: string;
  focus: string;
  outcomes: string[];
};

export const techStackGroups = [
  {
    title: "Languages",
    items: ["TypeScript", "Golang", "Java", "Python"],
  },
  {
    title: "Frontend",
    items: ["React.js", "Next.js", "React Native", "Expo"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Bun", "Spring", "Spring Boot"],
  },
  {
    title: "Data and Infra",
    items: ["Postgres", "Redis", "Kafka"],
  },
  {
    title: "Payments",
    items: ["Stripe", "Subscriptions", "Webhooks"],
  },
  {
    title: "AI and Docs",
    items: ["AI features", "API docs", "Product docs"],
  },
] as const;

export const deliveryCapabilities = [
  {
    title: "Scalable product foundations",
    description:
      "Design APIs, data models, queues, caching, and service boundaries that can grow with real users and real traffic.",
  },
  {
    title: "Full frontend experiences",
    description:
      "Build polished React, Next.js, and React Native interfaces that are fast, usable, accessible, and easy to evolve.",
  },
  {
    title: "Payment-ready platforms",
    description:
      "Integrate Stripe payments, subscriptions, checkout flows, customer portals, and webhook-driven billing workflows.",
  },
  {
    title: "AI-enabled workflows",
    description:
      "Add practical AI features such as assistants, automation, structured generation, search, and product copilots.",
  },
  {
    title: "Reliable backend systems",
    description:
      "Ship production backends with Node.js, Bun, Spring Boot, Postgres, Redis, Kafka, observability, and clear testing paths.",
  },
  {
    title: "Documentation that transfers context",
    description:
      "Write API docs, setup guides, architecture notes, and product documentation so teams can maintain what gets built.",
  },
] as const;

export const successOutcomes = [
  {
    title: "Ship faster with fewer rewrites",
    description:
      "I build reusable UI, shared product patterns, and maintainable service boundaries so teams can keep momentum as scope grows.",
  },
  {
    title: "Turn complex ideas into usable products",
    description:
      "I translate backend, AI, payments, and data workflows into clear product experiences people can actually use.",
  },
  {
    title: "Make systems easier to operate",
    description:
      "I care about reliability, caching, queues, observability, database design, and documentation before they become production pain.",
  },
  {
    title: "Leave teams with context",
    description:
      "I document architecture, APIs, setup steps, product behavior, and tradeoffs so future contributors can build with confidence.",
  },
] as const;

export const projects: PortfolioProject[] = [
  {
    title: "Astro Expo",
    description:
      "A proof of concept for sharing React Native components inside an Astro Starlight documentation site.",
    techStack: ["React Native", "Expo", "Uniwind", "TypeScript", "Astro", "Starlight"],
    status: "live",
    href: "https://astor-expo.saurabhmalvia997.workers.dev/",
    githubUrl: "https://github.com/malviys/astro-expo",
    focus: "Universal UI documentation",
    outcomes: [
      "Validated a path for rendering mobile-first components on the web.",
      "Documented the working Astro and Vite setup for reuse.",
      "Reduced duplicated UI work across mobile and web surfaces.",
    ],
  },
  {
    title: "Moe UI",
    description:
      "A universal component library bringing shadcn/ui-style patterns to React Native, NativeWind, iOS, Android, and web.",
    techStack: ["React Native", "NativeWind", "TypeScript", "Radix Primitives"],
    status: "live",
    href: "https://moe-ui.saurabhmalvia997.workers.dev/",
    focus: "Cross-platform design system",
    outcomes: [
      "Created a reusable UI foundation for product teams.",
      "Improved consistency across native and web experiences.",
      "Focused on accessible, composable primitives for faster shipping.",
    ],
  },
  {
    title: "Roshi",
    description:
      "A SaaS platform concept for building applications with modern workflows, scalable architecture, and strong developer experience.",
    techStack: ["Next.js", "TypeScript", "Node.js", "Postgres", "Redis", "Stripe", "AI features"],
    status: "development",
    focus: "Full-stack SaaS platform",
    outcomes: [
      "Explores end-to-end SaaS delivery from product UI to backend systems.",
      "Includes room for payments, AI workflows, documentation, and platform operations.",
      "Designed around maintainable architecture and repeatable delivery.",
    ],
  },
];
