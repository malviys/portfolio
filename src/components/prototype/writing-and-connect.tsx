"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Mail, MapPin } from "lucide-react";

import { Github, Instagram, Linkedin, Medium, Twitter } from "@/components/ui/icons";
import { LaurelBadge } from "@/components/prototype/laurel-badge";
import { PillCta } from "@/components/prototype/pill-cta";
import { SectionHeader } from "@/components/prototype/section-header";
import { SignatureSvg } from "@/components/prototype/signature-svg";

export interface PrototypePostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface WritingAndConnectProps {
  posts: PrototypePostSummary[];
}

const socials = [
  { label: "GitHub", href: "https://www.github.com/malviys", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/malviys", icon: Linkedin },
  { label: "Twitter", href: "https://www.twitter.com/malviys", icon: Twitter },
  { label: "Medium", href: "https://www.medium.com/@malviys", icon: Medium },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ma1viys?igsh=MTBuenViejl5MmxsMA==",
    icon: Instagram,
  },
];

/**
 * Real blog posts section + Contact/Connect section + giant watermark marquee.
 */
export function WritingAndConnect({ posts }: Readonly<WritingAndConnectProps>) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("saurabhmalvia997@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      setCopiedEmail(false);
    }
  };

  const mailtoHref = `mailto:saurabhmalvia997@gmail.com?subject=${encodeURIComponent(
    `Inquiry from ${name || "Portfolio Visitor"}`,
  )}&body=${encodeURIComponent(message || "Hi Sourabh, I'd love to connect about...")}`;

  return (
    <>
      {/* Writing / Learnings */}
      <section id="writing" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <SectionHeader
            eyebrow="Blog"
            title="Thoughts on"
            accentWord="engineering & craft."
            description="Notes on React Native universal UI, Spring AI tool calling, LLM behavior, and Docker optimization."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                data-gsap-reveal="card"
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-muted/40 hover:shadow-md"
              >
                <div>
                  <time className="font-mono text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Read post
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/blog">
              <PillCta label="View all posts" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact / Connect */}
      <section id="contact" className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-start">
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                Contact
              </span>
              <h2 className="text-3xl font-semibold leading-[1.2] tracking-tight sm:text-4xl sm:leading-[1.2] md:text-5xl md:leading-[1.2]">
                Let&apos;s work <span className="text-primary">together.</span>
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Open to discussing universal UI systems, React Native apps, generative AI
                integrations, and full-stack product engineering.
              </p>

              <div className="space-y-3 pt-2 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-foreground">Available for new projects</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>saurabhmalvia997@gmail.com</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] hover:bg-muted"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Based in India · Working worldwide</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Interactive Inquiry Composer */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="proto-name"
                  className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Your Name
                </label>
                <input
                  id="proto-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="proto-message"
                  className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Message
                </label>
                <textarea
                  id="proto-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about what you're building..."
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <a
                href={mailtoHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Mail className="h-4 w-4" />
                Send message
              </a>
            </div>
          </div>
        </div>

        {/* Experience badge + signature + Giant Reverse-Scrolling Footer Watermark */}
        <div className="mt-20 flex flex-col items-center gap-5 px-6 text-center">
          <LaurelBadge
            years="6+"
            label="6+ Years of Experience"
            subtitle="Coding since 2014 · Pro since 2020"
          />
          <SignatureSvg className="h-12 w-56 opacity-90" />
        </div>

        <div className="proto-marquee-group mt-10 overflow-hidden py-6 select-none opacity-15">
          <div className="proto-marquee-track-reverse text-6xl font-semibold tracking-tight sm:text-8xl lg:text-9xl">
            <span className="pr-14">Sourabh Malviya •</span>
            <span className="pr-14">Sourabh Malviya •</span>
            <span className="pr-14">Sourabh Malviya •</span>
          </div>
        </div>
      </section>
    </>
  );
}
