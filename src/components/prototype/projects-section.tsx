"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, Flip } from "gsap/all";
import { ArrowUpRight, Github, Layers, Smartphone, Sparkles, Terminal } from "lucide-react";

import { SectionHeader } from "@/components/prototype/section-header";
import { cn } from "@/lib/utils";

gsap.registerPlugin(Flip);

type ProjectCategory = "All" | "Universal UI" | "Mobile & AI" | "Platforms";
type ProjectStatus = "live" | "development";

interface ProjectItem {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, "All">;
  year: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  href?: string;
  githubUrl?: string;
  previewType: "unii" | "lyd" | "moe" | "astro" | "roshi";
}

const categories: ProjectCategory[] = ["All", "Universal UI", "Mobile & AI", "Platforms"];

const projects: ProjectItem[] = [
  {
    id: "unii",
    title: "Unii",
    category: "Platforms",
    year: "2026",
    description:
      "Unified Interface for Intelligence — a central platform for building and deploying grounded AI systems with hybrid retrieval, multi-model routing, and @unii/react.",
    techStack: ["@unii/sdk", "@unii/react", "Hybrid Retrieval", "Multi-Model Router"],
    status: "live",
    href: "https://getunii.com/",
    previewType: "unii",
  },
  {
    id: "astro-expo",
    title: "Astro Expo",
    category: "Universal UI",
    year: "2026",
    description:
      "A POC showcasing React Native components built with Uniwind inside an Astro Starlight documentation web application.",
    techStack: ["React Native", "Expo", "Uniwind", "TypeScript", "Astro", "Starlight"],
    status: "live",
    href: "https://astor-expo.saurabhmalvia997.workers.dev/",
    githubUrl: "https://github.com/malviys/astro-expo",
    previewType: "astro",
  },
  {
    id: "moe-ui",
    title: "Moe UI",
    category: "Universal UI",
    year: "2026",
    description:
      "Build your Universal Component Library. Bringing shadcn/ui to React Native with NativeWind — accessible components for iOS, Android, and Web.",
    techStack: ["React Native", "NativeWind", "TypeScript", "Radix Primitives"],
    status: "live",
    href: "https://moe-ui.saurabhmalvia997.workers.dev/",
    previewType: "moe",
  },
  {
    id: "lyd",
    title: "LYD",
    category: "Mobile & AI",
    year: "2026",
    description:
      "An AI outfit generator and fashion stylist app that scans closet items, generates outfit suggestions, and extracts color palettes.",
    techStack: ["Expo", "Elysia", "Gemini Gen API", "TypeScript"],
    status: "development",
    href: "/project/lyd",
    previewType: "lyd",
  },
  {
    id: "roshi",
    title: "Roshi",
    category: "Platforms",
    year: "2026",
    description:
      "A SaaS platform for building applications the better way — streamlining development workflows with modern tooling and best practices.",
    techStack: ["TypeScript", "Next.js", "Developer Tooling"],
    status: "development",
    previewType: "roshi",
  },
];

function ProjectPreview({ project }: Readonly<{ project: ProjectItem }>) {
  if (project.previewType === "unii") {
    return (
      <div className="relative flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-[#0b0d13] p-4 text-[#f0f3fa] transition-transform duration-500 group-hover:scale-[1.02]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-8 -top-8 h-36 w-36 rounded-full bg-[#6250b8]/35 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[#2ea892]/25 blur-2xl"
        />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            unii<span className="text-[#a799fa]">.</span>
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-[#949db1]">
            getunii.com
          </span>
        </div>

        <div className="relative z-10 space-y-2.5 rounded-lg border border-white/10 bg-[#141721]/85 p-3 backdrop-blur-md">
          <p className="text-xs font-medium text-[#f0f3fa]">
            Unified Interface for Intelligence
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#a799fa]/15 px-2 py-0.5 text-[10px] font-medium text-[#a799fa]">
              Hybrid Retrieval
            </span>
            <span className="rounded-full bg-[#2ea892]/15 px-2 py-0.5 text-[10px] font-medium text-[#2ea892]">
              OpenAI · Claude · Gemini
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (project.previewType === "lyd") {
    return (
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-purple-500/10 p-4">
        <div className="flex items-center gap-4 transition-transform duration-500 group-hover:scale-[1.03]">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-border/70 shadow-lg">
            <Image
              src="/images/lyd/app-icon.png"
              alt="LYD app icon"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="h-36 w-20 overflow-hidden rounded-xl border border-border/70 bg-background shadow-lg">
            <Image
              src="/images/lyd/preview-4.png"
              alt="LYD AI-generated outfit preview"
              width={260}
              height={560}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  if (project.previewType === "moe") {
    return (
      <div className="flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-blue-500/10 via-card to-background p-4 transition-transform duration-500 group-hover:scale-[1.02]">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>@moe-ui/primitives</span>
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-primary">iOS · Android · Web</span>
        </div>
        <div className="space-y-2 rounded-lg border border-border/70 bg-background/80 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              Button
            </span>
            <span className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium">
              Dialog
            </span>
            <span className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-medium">
              Tabs
            </span>
          </div>
          <div className="h-1.5 w-2/3 rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  if (project.previewType === "astro") {
    return (
      <div className="flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-purple-500/10 via-card to-background p-4 font-mono text-xs transition-transform duration-500 group-hover:scale-[1.02]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span>starlight + expo</span>
        </div>
        <div className="space-y-1.5 rounded-lg border border-border/70 bg-background/85 p-3 text-[11px]">
          <p className="text-primary">{"<ExpoPreview component={Card} />"}</p>
          <p className="text-muted-foreground">✓ Uniwind tokens synced</p>
          <p className="text-emerald-500">✓ Deployed on Cloudflare Workers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-48 flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-amber-500/10 via-card to-background p-4 transition-transform duration-500 group-hover:scale-[1.02]">
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-amber-500" />
          Roshi Workspace
        </span>
        <span>v0.1</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Scaffold", "Workflow", "Ship"].map((step) => (
          <div
            key={step}
            className="rounded-lg border border-border/70 bg-background/85 p-2.5 text-center text-[11px] font-medium"
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Filterable Portfolio grid using GSAP Flip for fluid layout transitions.
 */
export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const visibleProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  const handleCategoryChange = (nextCategory: ProjectCategory) => {
    if (nextCategory === activeCategory) return;
    if (gridRef.current) {
      flipStateRef.current = Flip.getState(
        gridRef.current.querySelectorAll("[data-flip-card]"),
      );
    }
    setActiveCategory(nextCategory);
  };

  useLayoutEffect(() => {
    if (!flipStateRef.current || !gridRef.current) return;
    const state = flipStateRef.current;
    flipStateRef.current = null;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    Flip.from(state, {
      duration: 0.45,
      ease: "power2.out",
      stagger: 0.04,
      absolute: false,
      onEnter: (elements) =>
        gsap.fromTo(elements, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35 }),
    });
  }, [activeCategory]);

  return (
    <section id="projects" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeader
          eyebrow="Work"
          title="Things I'm"
          accentWord="building."
          description="Universal UI libraries, mobile AI products, and developer platforms."
        />

        {/* Segmented filter tabs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Project Cards */}
        <div ref={gridRef} className="grid gap-5 md:grid-cols-2">
          {visibleProjects.map((project) => {
            const isExternal = Boolean(project.href?.startsWith("http"));
            const isFeaturedWide = activeCategory === "All" && project.id === "unii";
            return (
              <article
                key={project.id}
                data-flip-card={project.id}
                className={cn(
                  "group relative flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-3 pb-6 transition-all duration-300 hover:bg-muted/40 hover:shadow-lg",
                  isFeaturedWide && "md:col-span-2 md:grid md:grid-cols-[1.05fr_1fr] md:items-center md:gap-6 md:p-4",
                )}
              >
                <ProjectPreview project={project} />

                <div className="space-y-4 px-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                        {project.category === "Mobile & AI" ? (
                          <Smartphone className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span>{project.category}</span>
                        <span>·</span>
                        <span>{project.year}</span>
                      </div>
                      <h3 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
                        {project.title}
                      </h3>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          project.status === "live" ? "bg-emerald-400" : "bg-amber-400",
                        )}
                      />
                      {project.status === "live" ? "Live" : "In Development"}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>

                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border/50 pt-4">
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Github className="h-4 w-4" />
                        Source
                      </a>
                    ) : (
                      <span className="font-mono text-[11px] text-muted-foreground/70">
                        {project.status === "live" ? "Production" : "Active Build"}
                      </span>
                    )}

                    {project.href ? (
                      <Link
                        href={project.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        {isExternal ? "Visit Site" : "View Case Study"}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
