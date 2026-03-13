import DotGrid from "@/components/ui/dot-grid";
import { ProjectCard } from "@/components/ui/project-card";
import { TypewriterRole } from "@/components/ui/typewriter-role";

const projects = [
  {
    title: "Astro Expo",
    description:
      "A POC showcasing React Native components built with Uniwind within an Astro Starlight web application.",
    techStack: ["React Native", "Expo", "Uniwind", "TypeScript", "Astro", "Starlight"],
    status: "live" as const,
    href: "https://astor-expo.saurabhmalvia997.workers.dev/",
    githubUrl: "https://github.com/malviys/astro-expo",
  },
  {
    title: "Moe UI",
    description:
      "Build your Universal Component Library. Bringing shadcn/ui to React Native with NativeWind — beautifully crafted, accessible components for iOS, Android, and Web.",
    techStack: ["React Native", "NativeWind", "TypeScript", "Radix Primitives"],
    status: "live" as const,
    href: "https://moe-ui.saurabhmalvia997.workers.dev/",
  },
  {
    title: "Roshi",
    description:
      "A SaaS platform for building applications the better way — streamlining development workflows with modern tooling and best practices.",
    techStack: [],
    status: "development" as const,
  },
];

export default function Home() {
  return (
    <main className="relative">
      <div className="absolute top-0 left-0 w-full h-full">
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

      <div className="container mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section id="hero" className="flex min-h-[85vh] flex-col items-center justify-center text-center">
          <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Sourabh Malviya
          </h1>
          <p className="animate-fade-in-up delay-100 mt-4 text-xl font-bold text-gradient sm:text-2xl md:text-3xl lg:text-4xl">
            <TypewriterRole />
          </p>
          <p className="animate-fade-in-up delay-200 mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Building products that people love — from mobile apps to scalable platforms.
          </p>
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
      </div>
    </main>
  );
}

