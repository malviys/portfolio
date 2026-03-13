import Link from "next/link";
import { Github, Linkedin, Mail, Instagram } from "lucide-react";

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/malviys",
    icon: Linkedin,
  },
  {
    label: "GitHub",
    href: "https://www.github.com/malviys",
    icon: Github,
  },
  {
    label: "Email",
    href: "mailto:saurabhmalvia997@gmail.com?subject=Connection Request",
    icon: Mail,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ma1viys",
    icon: Instagram,
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Sourabh Malviya</p>
        <nav className="flex items-center gap-4">
          {socials.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
