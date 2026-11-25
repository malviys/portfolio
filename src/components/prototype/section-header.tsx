import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  accentWord?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

/**
 * Clean, minimal section header matching portfolio-nextjs-template's rhythm:
 * rounded primary pill badge + two-tone heading + generous whitespace.
 */
export function SectionHeader({
  eyebrow,
  title,
  accentWord,
  description,
  align = "center",
  className,
}: Readonly<SectionHeaderProps>) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-12 sm:pb-16",
        isCentered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
        {eyebrow}
      </span>

      <h2
        data-gsap-split="heading"
        className="text-3xl font-semibold leading-[1.2] tracking-tight sm:text-4xl sm:leading-[1.2] md:text-5xl md:leading-[1.2]"
      >
        {title}{" "}
        {accentWord ? <span className="text-primary">{accentWord}</span> : null}
      </h2>

      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
