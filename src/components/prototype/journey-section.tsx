"use client";

import { Briefcase, Code2, GraduationCap } from "lucide-react";

import { SectionHeader } from "@/components/prototype/section-header";
import { cn } from "@/lib/utils";

interface JourneyItem {
  id: string;
  step: string;
  period: string;
  role: string;
  stage: string;
  summary: string;
  highlights: string[];
  current?: boolean;
  kind: "milestone" | "education" | "work";
}

const journeyItems: JourneyItem[] = [
  {
    id: "2024-present",
    step: "05",
    period: "2024 — Present",
    role: "Senior Frontend Engineer",
    stage: "Third Role · Current",
    summary:
      "Leading frontend craft, universal UI systems, and fluid interactive experiences across web and mobile.",
    highlights: [
      "Architecting React, Next.js, TypeScript, and React Native UI systems",
      "Crafting accessible design primitives and smooth GSAP motion choreography",
    ],
    current: true,
    kind: "work",
  },
  {
    id: "2022",
    step: "04",
    period: "2022",
    role: "Senior Software Engineer",
    stage: "Second Role",
    summary:
      "Owned end-to-end product delivery across React Native apps, web platforms, and scalable APIs.",
    highlights: [
      "Led mobile and full-stack feature architecture",
      "Improved system reliability and runtime performance",
    ],
    kind: "work",
  },
  {
    id: "2020",
    step: "03",
    period: "2020",
    role: "Programmer Analyst",
    stage: "First Job",
    summary:
      "Started my professional career shipping production software and mastering engineering fundamentals.",
    highlights: [
      "Delivered production features in enterprise teams",
      "Built discipline around code quality and testing",
    ],
    kind: "work",
  },
  {
    id: "2019",
    step: "02",
    period: "2019",
    role: "Engineering in CSE",
    stage: "Computer Science & Engineering",
    summary:
      "Pursued Computer Science & Engineering, grounding curiosity in algorithms and software systems.",
    highlights: [
      "Core CS in data structures, OS, and databases",
      "Bridged theory into practical web and mobile builds",
    ],
    kind: "education",
  },
  {
    id: "2014",
    step: "01",
    period: "2014",
    role: "First Line of Code",
    stage: "High School",
    summary:
      "Wrote my very first code in high school — the spark that turned curiosity into a lifelong craft.",
    highlights: [
      "Discovered programming logic & problem solving",
      "Built early hands-on experiments from scratch",
    ],
    kind: "milestone",
  },
];

function MilestoneIcon({ kind }: Readonly<{ kind: JourneyItem["kind"] }>) {
  if (kind === "education") {
    return <GraduationCap className="h-4 w-4 text-primary" />;
  }
  if (kind === "milestone") {
    return <Code2 className="h-4 w-4 text-primary" />;
  }
  return <Briefcase className="h-4 w-4 text-primary" />;
}

/**
 * Clean static Bento grid for Experience & Journey — all milestones visible at a glance
 * with smooth GSAP ScrollTrigger card reveals and zero expand/shrink layout shifts.
 */
export function JourneySection() {
  return (
    <section id="journey" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <SectionHeader
          eyebrow="Experience"
          title="My journey from"
          accentWord="2014 to present."
          description="A decade-plus path from writing my first code in high school to leading frontend engineering today."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {journeyItems.map((item) => (
            <article
              key={item.id}
              data-gsap-reveal="card"
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 transition-colors duration-300 sm:p-7",
                item.current
                  ? "border-primary/40 shadow-lg shadow-primary/5 md:col-span-2"
                  : "border-border hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              {/* Faint editorial step watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-5 font-mono text-3xl font-semibold tracking-tighter text-foreground/[0.06] tabular-nums"
              >
                {item.step}
              </span>

              <div className={cn(item.current && "md:grid md:grid-cols-[1.1fr_1fr] md:gap-8 md:items-start")}>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <MilestoneIcon kind={item.kind} />
                    </span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                      {item.period}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {item.stage}
                    </span>
                    {item.current && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Currently working
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {item.role}
                  </h3>

                  <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                </div>

                <ul
                  className={cn(
                    "mt-5 space-y-2 border-t border-border/60 pt-4",
                    item.current && "md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-1",
                  )}
                >
                  {item.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
