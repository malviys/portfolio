import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";

import { projects } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Sourabh Malviya showing scalable full-stack product work across frontend, backend, payments, AI features, and documentation.",
  alternates: { canonical: "https://malviys.com/project" },
  openGraph: {
    type: "website",
    url: "https://malviys.com/project",
    title: "Projects | Sourabh Malviya",
    description:
      "Projects by Sourabh Malviya showing scalable full-stack product work across frontend, backend, payments, AI features, and documentation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Sourabh Malviya",
    creator: "@malviys",
  },
};

export default function Project() {
  return (
    <main className="relative min-h-[85vh] py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <header className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">Projects</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Work that connects product, platform, and delivery.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            These projects show how I think about reusable UI, scalable foundations, developer experience, and complete
            product systems that can include backend services, frontend experiences, payments, AI features, and docs.
          </p>
        </header>

        <div className="grid gap-6">
          {projects.map((project) => (
            <article key={project.title} className="glass rounded-md p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{project.title}</h2>
                    <span className="rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {project.status === "live" ? "Live" : "In development"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{project.focus}</p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">{project.description}</p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  {project.githubUrl && (
                    <Link
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
                    >
                      <Github className="h-4 w-4" />
                      Source
                    </Link>
                  )}
                  {project.href && (
                    <Link
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Visit
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Contribution
                  </h3>
                  <ul className="space-y-3">
                    {project.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
