import type { Metadata } from "next";
import Link from "next/link";
import { Bot, CreditCard, FileText, Layers3 } from "lucide-react";

import { techStackGroups } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Sourabh Malviya, a Senior Software Engineer building scalable backend-to-frontend products with payments, AI features, and documentation.",
  alternates: { canonical: "https://malviys.com/about" },
  openGraph: {
    type: "profile",
    url: "https://malviys.com/about",
    title: "About | Sourabh Malviya",
    description:
      "Learn more about Sourabh Malviya, a Senior Software Engineer building scalable backend-to-frontend products with payments, AI features, and documentation.",
  },
  twitter: {
    card: "summary",
    title: "About | Sourabh Malviya",
    creator: "@malviys",
  },
};

export default function About() {
  const highlights = [
    {
      title: "End-to-end engineering",
      description:
        "I can move across product UI, backend services, databases, integrations, and deployment-ready architecture.",
      icon: Layers3,
    },
    {
      title: "Payments and SaaS workflows",
      description:
        "I can wire Stripe checkout, subscriptions, portals, webhooks, and backend billing state into real products.",
      icon: CreditCard,
    },
    {
      title: "AI product features",
      description:
        "I can add practical AI workflows, assistants, search, automation, and structured generation where they help users.",
      icon: Bot,
    },
    {
      title: "Clear documentation",
      description:
        "I write API docs, architecture notes, setup guides, and product docs so teams can maintain and extend the work.",
      icon: FileText,
    },
  ];

  return (
    <main className="relative min-h-[85vh] py-20 sm:py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">About</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            I build scalable products from backend to frontend.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            I am a senior software engineer focused on turning ideas into reliable, maintainable software. My work
            spans TypeScript, Golang, Java, Python, React.js, Next.js, Spring Boot, Node.js, Bun, Postgres, Redis, Kafka,
            Stripe integrations, AI features, and the documentation teams need to keep moving.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/project"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              See Project Work
            </Link>
            <Link
              href="mailto:saurabhmalvia997+portfolio@gmail.com?subject=Project%20Conversation"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Contact Me
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-2">
          {highlights.map(({ title, description, icon: Icon }) => (
            <article key={title} className="glass rounded-md p-5">
              <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-20">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Stack</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Tools I use to ship complete solutions.</h2>
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
      </div>
    </main>
  );
}
