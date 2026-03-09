import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LearningCardProps = Readonly<{
  title: string;
  description: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  tags?: string[];
  className?: string;
}>;

export function LearningCard({
  title,
  description,
  createdAt,
  publishedAt,
  updatedAt,
  slug,
  tags = [],
  className,
}: LearningCardProps) {
  const displayDate = publishedAt || createdAt;
  return (
    <Link href={`/blog/${slug}`} className="group block h-full">
      <article
        className={cn(
          "relative flex h-full flex-col gap-4 rounded-2xl p-6 sm:p-8",
          "glass transition-all duration-500",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
          "hover:-translate-y-1",
          className,
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <time dateTime={displayDate} className="text-sm font-medium text-muted-foreground">
            {new Date(displayDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h3 className="text-xl font-bold tracking-tight sm:text-2xl group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base line-clamp-3">{description}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Link Indicator */}
        <div className="flex items-center gap-1 mt-auto pt-4 text-sm font-medium text-primary transition-transform duration-300 group-hover:translate-x-1">
          Read More <ArrowRight className="h-4 w-4" />
        </div>
      </article>
    </Link>
  );
}
