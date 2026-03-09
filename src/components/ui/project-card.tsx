"use client";

import { ArrowUpRight, Github } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Status = "live" | "development";

interface ProjectCardProps {
  title: string;
  description: string;
  techStack: string[];
  status: Status;
  href?: string;
  githubUrl?: string;
  className?: string;
}

const statusConfig: Record<Status, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-emerald-400" },
  development: { label: "In Development", dot: "bg-amber-400" },
};

export function ProjectCard({
  title,
  description,
  techStack,
  status,
  href,
  githubUrl,
  className,
}: Readonly<ProjectCardProps>) {
  const { label, dot } = statusConfig[status];

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl p-6 sm:p-8",
        "glass transition-all duration-500",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "hover:-translate-y-1",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
          {href ? (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="before:absolute before:inset-0 before:z-10 text-foreground"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <div className="flex items-center gap-2 shrink-0 relative z-20">
          <span className={cn("h-2 w-2 rounded-full", dot)} />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base relative z-20 pointer-events-none">
        {description}
      </p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mt-auto relative z-20 pointer-events-none">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Link indicator */}
      <div className="flex items-center gap-4 mt-auto pt-4 relative z-20">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            Source
          </a>
        )}
        {href ? (
          <div className="flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-300 group-hover:translate-x-1 ml-auto">
            Visit <ArrowUpRight className="h-4 w-4" />
          </div>
        ) : (
          <div className="text-sm font-medium text-muted-foreground/60 ml-auto">Coming Soon</div>
        )}
      </div>
    </article>
  );
}
