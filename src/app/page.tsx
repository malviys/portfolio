import Link from "next/link";
import { Bot, CreditCard, Database, FileText, Layers3, ServerCog } from "lucide-react";

import DotGrid from "@/components/ui/dot-grid";
import { LearningCard } from "@/components/ui/learning-card";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { ProjectCard } from "@/components/ui/project-card";
import { TypewriterRole } from "@/components/ui/typewriter-role";
import { getBlogPosts } from "@/lib/blog";
import { deliveryCapabilities, projects, successOutcomes, techStackGroups } from "@/lib/portfolio";

const capabilityIcons = [Layers3, ServerCog, CreditCard, Bot, Database, FileText] as const;

export default async function Home() {
  const learnings = (await getBlogPosts()).slice(0, 3).map((learning) => ({
    ...learning,
    createdAt: learning.createdAt || learning.publishedAt || new Date().toISOString(),
  }));

  return (
    <main className="relative">
      <div className="absolute left-0 top-0 h-full w-full">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColorDark="#ffffff15"
          baseColorLight="#00000015"
          activeColorDark="#5227FF"
          activeColorLight="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section id="hero" className="flex min-h-[85vh] flex-col items-center justify-center text-center">
          <LineShadowText
            as="h1"
            className="animate-fade-in-up text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            shadowColor="hsl(var(--primary) / 0.85)"
          >
            Sourabh Malviya
          </LineShadowText>
          <p className="animate-fade-in-up delay-100 mt-4 text-xl font-bold text-gradient sm:text-2xl md:text-3xl lg:text-4xl">
            <TypewriterRole />
          </p>
          <p className="animate-fade-in-up delay-200 mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            I build entire scalable solutions from backend systems to polished frontend experiences, with payments,
            AI features, and documentation that help teams ship with confidence.
          </p>
          <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/project"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Projects
            </Link>
            <Link
              href="mailto:saurabhmalvia997+portfolio@gmail.com?subject=Project%20Conversation"
              className="rounded-md border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              Start a Conversation
            </Link>
          </div>
        </section>

        {/* Capabilities */}
        <section id="solutions" className="py-16 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              How I help
            </h2>
            <p className="text-2xl font-bold tracking-tight sm:text-4xl">
              From product idea to production system.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              I can contribute across the full lifecycle: architecture, frontend, backend, AI workflows, payments,
              deployment readiness, and the docs that keep future work understandable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deliveryCapabilities.map((capability, index) => {
              const Icon = capabilityIcons[index];

              return (
                <article key={capability.title} className="glass rounded-md p-5">
                  <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold tracking-tight">{capability.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{capability.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Outcomes */}
        <section id="success" className="py-16 sm:py-24">
          <div className="mb-10 max-w-2xl">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Contribution to your success
            </h2>
            <p className="text-2xl font-bold tracking-tight sm:text-4xl">
              Building with clarity, speed, and long-term ownership.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              I help teams reduce delivery risk, build systems that scale, and keep the work understandable after
              launch.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {successOutcomes.map((outcome, index) => (
              <article key={outcome.title} className="glass rounded-md p-5">
                <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold tracking-tight">{outcome.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{outcome.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section id="stack" className="py-16 sm:py-24">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Tech stack
            </h2>
            <p className="text-2xl font-bold tracking-tight sm:text-4xl">
              Practical tools for scalable products.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStackGroups.map((group) => (
              <section key={group.title} className="glass rounded-md p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-20 sm:py-28">
          <h2 className="animate-fade-in-up mb-4 text-center text-sm font-semibold uppercase tracking-widest text-primary">
            Projects
          </h2>
          <p className="animate-fade-in-up delay-100 mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Things I&apos;m building
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project, i) => (
              <ProjectCard key={project.title} {...project} className={`animate-fade-in-up delay-${(i + 2) * 100}`} />
            ))}
          </div>
        </section>

        {/* Technical Proof */}
        <section id="learnings" className="py-20 sm:py-28">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Technical proof
              </h2>
              <p className="text-2xl font-bold tracking-tight sm:text-4xl">
                I document what I learn while building.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                These notes show the way I investigate problems, explain tradeoffs, and turn rough edges into reusable
                knowledge.
              </p>
            </div>
            <Link
              href="/blog"
              className="w-fit rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Read Learnings
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learnings.map((learning) => (
              <LearningCard key={learning.slug} {...learning} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
