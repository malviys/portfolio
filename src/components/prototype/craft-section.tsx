"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/prototype/section-header";
import {
  AstroIcon,
  DockerIcon,
  ExpoIcon,
  JavaIcon,
  JavaScriptIcon,
  NextjsIcon,
  PostgresIcon,
  PythonIcon,
  ReactNativeIcon,
  SpringBootIcon,
  SpringAiIcon,
  TypeScriptIcon,
} from "@/components/ui/tech-icons";
import { cn } from "@/lib/utils";

const hexTools = [
  {
    name: "TypeScript",
    icon: TypeScriptIcon,
    detail: "Strict end-to-end type safety",
  },
  {
    name: "JavaScript",
    icon: JavaScriptIcon,
    detail: "Modern ESNext & dynamic web runtimes",
  },
  {
    name: "Python",
    icon: PythonIcon,
    detail: "AI scripting, embeddings & agentic workflows",
  },
  {
    name: "Java",
    icon: JavaIcon,
    detail: "Enterprise JVM backend services",
  },
  {
    name: "React Native",
    icon: ReactNativeIcon,
    detail: "Cross-platform native mobile UI",
  },
  {
    name: "Next.js",
    icon: NextjsIcon,
    detail: "App Router & RSC architecture",
  },
  {
    name: "Expo",
    icon: ExpoIcon,
    detail: "Universal native runtime & builds",
  },
  {
    name: "Astro",
    icon: AstroIcon,
    detail: "Content-first Starlight docs",
  },
  {
    name: "Spring Boot",
    icon: SpringBootIcon,
    detail: "Production microservices & REST APIs",
  },
  {
    name: "Spring AI",
    icon: SpringAiIcon,
    detail: "Java tool calling & advisors",
  },
  {
    name: "Postgres",
    icon: PostgresIcon,
    detail: "Relational data modeling & queries",
  },
  {
    name: "Docker",
    icon: DockerIcon,
    detail: "Lean multi-stage containers",
  },
];

const craftMetrics = [
  { target: 6, suffix: "+", label: "Years of Professional Experience" },
  { target: 5, suffix: "+", label: "Featured Products Shipped" },
  { target: 8, suffix: "+", label: "Technical Deep-Dives Published" },
];

const processSteps = [
  {
    index: "01",
    title: "System Architecture",
    description:
      "Design crisp boundaries between mobile clients, typed APIs, and AI tool execution before writing UI.",
  },
  {
    index: "02",
    title: "Universal Craft",
    description:
      "Build accessible primitives once with NativeWind, Uniwind, and Tailwind so design tokens stay consistent.",
  },
  {
    index: "03",
    title: "Production Delivery",
    description:
      "Optimize container layers, bundle performance, and observability for reliable real-world releases.",
  },
];

/**
 * Stack grid + Tabular GSAP count-up metrics + 3-step process.
 */
export function CraftSection() {
  const [hoveredTool, setHoveredTool] = useState<string>("TypeScript — Strict end-to-end type safety");

  return (
    <section id="craft" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeader
          eyebrow="What I do"
          title="Craft & tools that"
          accentWord="amplify every build."
        />

        {/* 2-Column Split: Tech Stack Grid + Count-up Metrics */}
        <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 sm:p-10">
            <div className="flex max-w-md flex-wrap items-center justify-center gap-3">
              {hexTools.map((tool) => (
                <button
                  key={tool.name}
                  type="button"
                  onMouseEnter={() => setHoveredTool(`${tool.name} — ${tool.detail}`)}
                  onFocus={() => setHoveredTool(`${tool.name} — ${tool.detail}`)}
                  className={cn(
                    "group relative flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-border bg-background p-2 transition-all duration-300",
                    "hover:-translate-y-1 hover:scale-[1.04] hover:border-primary/40 hover:bg-primary/10",
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <tool.icon className="h-6 w-6 shrink-0" />
                  </span>
                  <span className="mt-1 px-0.5 text-center text-[11px] font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 rounded-full bg-muted px-4 py-1.5 font-mono text-xs text-muted-foreground">
              {hoveredTool}
            </p>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {craftMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between px-6 py-7 sm:px-8">
                <span className="text-sm font-medium text-muted-foreground sm:text-base">
                  {metric.label}
                </span>
                <span
                  data-gsap-count={metric.target}
                  data-gsap-suffix={metric.suffix}
                  className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-primary sm:text-5xl"
                >
                  0{metric.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Column Process Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {processSteps.map((step) => (
            <div
              key={step.index}
              data-gsap-reveal="card"
              className="rounded-2xl border border-border bg-card p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                  {step.index}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
