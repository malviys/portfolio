"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { SignatureSvg } from "@/components/prototype/signature-svg";
import { Github, Instagram, Linkedin, Mail, Medium, Twitter } from "@/components/ui/icons";

const aboutSocials = [
  { label: "GitHub", href: "https://www.github.com/malviys", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/malviys", icon: Linkedin },
  { label: "Twitter", href: "https://www.twitter.com/malviys", icon: Twitter },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ma1viys?igsh=MTBuenViejl5MmxsMA==",
    icon: Instagram,
  },
  { label: "Medium", href: "https://www.medium.com/@malviys", icon: Medium },
  {
    label: "Email",
    href: "mailto:saurabhmalvia997@gmail.com?subject=Connection Request",
    icon: Mail,
  },
];

/**
 * Two-column About summary matching portfolio-nextjs-template:
 * portrait + identity + signature + socials on left; two-tone heading, pills, and bio on right.
 */
export function AboutSection() {
  return (
    <section id="about" className="relative z-[1] py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-6 sm:px-8 md:grid-cols-[minmax(0,21rem)_1fr] lg:gap-16">
        {/* Left identity column */}
        <div className="flex flex-col items-start">
          <div
            data-gsap-about-portrait="true"
            className="relative aspect-square w-full max-w-[21rem] overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/30 shadow-sm"
          >
            <Image
              data-gsap-about-image="true"
              src="/images/profile/malviys-portrait.jpg"
              alt="Sourabh Malviya"
              fill
              sizes="(max-width: 768px) 100vw, 336px"
              className="object-cover object-center"
            />
          </div>

          <div data-gsap-reveal="card" className="flex flex-col items-start">
            <div className="mt-5">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Sourabh Malviya
              </h3>
              <p className="text-sm text-muted-foreground">Senior Frontend Engineer</p>
            </div>

            <SignatureSvg className="mt-4 h-11 w-52 text-foreground/85" />

            <nav aria-label="Social profiles" className="mt-4 flex flex-wrap items-center gap-3">
              {aboutSocials.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  aria-label={label}
                  title={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Right narrative column */}
        <div className="space-y-6">
          <h2
            data-gsap-split="heading"
            className="text-3xl font-semibold leading-[1.22] tracking-tight sm:text-4xl sm:leading-[1.22] md:text-5xl md:leading-[1.22]"
          >
            I love turning ideas into{" "}
            <span className="block text-primary">something real through code.</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
              <MapPin className="h-3.5 w-3.5" />
              INDIA
            </span>
            <span className="inline-flex items-center rounded-full bg-primary px-3.5 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
              6+ Years Experience
            </span>
          </div>

          <div className="space-y-5 pt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              What started as high school curiosity in 2014 turned into a career when I discovered
              how software can make complex systems feel effortless and reliable.
            </p>
            <p>
              <strong className="font-semibold text-foreground">
                Making sure products aren&apos;t just fast, but actually solve problems.
              </strong>{" "}
              Whether I&apos;m building a React Native app, a universal UI library, or an AI
              platform, my goal is to ship experiences that feel natural and easy to use.
            </p>
            <p>
              From CSE foundations to leading frontend engineering today, every project starts with
              understanding the people who&apos;ll use it—then shaping an interface they come back
              to without thinking twice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
