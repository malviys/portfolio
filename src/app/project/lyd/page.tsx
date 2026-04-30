import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowDownToLine, ArrowLeft, Apple, Smartphone } from "lucide-react";
import { blurHashToDataURL } from "@/lib/blurhash";

const keyFeatures = [
  "Scan and save closet items using the camera",
  "Generate complete outfits from your personal wardrobe",
  "Get AI-powered styling suggestions for different occasions",
  "Extract matching color palettes from your outfit images",
];

const metadataItems = [
  { label: "Rating", value: "4.8" },
  { label: "Category", value: "Fashion" },
  { label: "Built With", value: "Expo + Elysia" },
  { label: "AI", value: "Gemini Gen API" },
];

const appIconImage = {
  src: "/images/lyd/app-icon.png",
  alt: "LYD app icon",
  blurHash: "U77nRRof00oft7ayWBof00WB~qWBM{oft7WB",
};

const previewImages = [
  {
    src: "/images/lyd/preview-4.png",
    alt: "LYD AI-generated looks screen",
    blurHash: "UoNAhvn%xuxuWARjt7of~qoLWBWBxus:azfk",
  },
  {
    src: "/images/lyd/preview-3.png",
    alt: "LYD personalized style inspiration screen",
    blurHash: "U7P%Fb_3?G_4~pIURj?H~q%1-;Mx%MM}_3IU",
  },
  {
    src: "/images/lyd/preview-1.png",
    alt: "LYD generation progress screen",
    blurHash: "U9Ryg4%M~q?aR+of?Hj[j]t7t7ofadRjt7t7",
  },
  {
    src: "/images/lyd/preview-2.png",
    alt: "LYD closet item selection screen",
    blurHash: "UYN0|_Rk%MWBRkayj[ay~XoffioftPoLt7WC",
  },
];

export const metadata: Metadata = {
  title: "LYD | Project",
  description:
    "LYD is an AI outfit generator and fashion stylist app that scans closet items, generates outfits, and creates color palettes from user images.",
};

export default function LydProjectPage() {
  return (
    <main className="container mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-[1.6rem] border border-border/60 shadow-lg shadow-black/20">
            <Image
              src={appIconImage.src}
              alt={appIconImage.alt}
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
              placeholder="blur"
              blurDataURL={blurHashToDataURL(appIconImage.blurHash)}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Fashion Assistant</p>
            <div className="mt-2 inline-flex items-start gap-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">LYD</h1>
              <span className="mt-0.5 inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:text-[11px]">
                Early Preview
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Outfit generator and personal stylist app that helps users discover what to wear from their own closet.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex items-center gap-2">
              <a
                href="https://play.google.com/apps/internaltest/4700855695080544894"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-foreground transition-colors hover:bg-secondary"
                aria-label="Download LYD for Android"
                title="Open Android internal test"
              >
                <Smartphone className="h-5 w-5" />
                <ArrowDownToLine className="h-4 w-4" />
              </a>
              <button
                type="button"
                disabled
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border/70 bg-secondary/60 px-3 text-muted-foreground"
                aria-label="iOS build coming soon"
                title="iOS coming soon"
              >
                <Apple className="h-5 w-5" />
                <ArrowDownToLine className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metadataItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-base font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl sm:p-8">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Preview</h2>
        <div className="mt-5 flex gap-3 overflow-x-auto overscroll-x-contain pb-2 scroll-smooth snap-x snap-mandatory sm:gap-4">
          {previewImages.map((image) => (
            <div
              key={image.src}
              className="w-32 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-sm sm:w-36"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={1290}
                height={2796}
                className="h-64 w-full object-cover sm:h-72"
                sizes="(max-width: 640px) 128px, 144px"
                placeholder="blur"
                blurDataURL={blurHashToDataURL(image.blurHash)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">About This App</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            LYD helps users digitize their wardrobe and turn it into practical, personalized outfit recommendations.
            Users can scan clothes, organize items, and generate complete looks with matching color palettes for daily
            wear, events, and seasonal styling.
          </p>
          <h3 className="mt-7 text-lg font-semibold">Key Features</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground sm:text-base">
            {keyFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl sm:p-8">
            <h2 className="text-xl font-bold tracking-tight">Tech Stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Expo", "Elysia", "Gemini Gen API", "TypeScript"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Mobile-first architecture with an Expo app, Elysia backend services, and Gemini-powered outfit generation
              and color intelligence.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
