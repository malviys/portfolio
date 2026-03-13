"use client";

import { useTypewriter } from "@/hooks/typewriter";

const roles = [
  "Sr. Software Engineer",
  "Full Stack Developer",
  "React Native",
  "TypeScript",
  "Node.JS",
] as const;

export function TypewriterRole() {
  const role = useTypewriter(roles, "Sr. Software Engineer");
  return (
    <>
      {role}
      <span className="animate-ping text-primary">.</span>
    </>
  );
}
