"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import Interactive from "@/components/ui/interactive";

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/40">
      <div className="container mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Interactive>
          <Link href="/" className="text-lg font-bold tracking-tight transition-colors hover:text-primary">
            malviys
          </Link>
        </Interactive>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Interactive>
            <Link
              href="#projects"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Projects
            </Link>
          </Interactive>
          <Interactive>
            <Link
              href="https://www.github.com/malviys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
          </Interactive>
          <Interactive>
            <Link
              href="https://www.linkedin.com/in/malviys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              LinkedIn
            </Link>
          </Interactive>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute left-2 top-2 h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>
        </nav>
      </div>
    </header>
  );
}
