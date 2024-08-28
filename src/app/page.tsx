"use client";

import { Pointer } from "@/components/ui/pointer";
import { useMouse } from "@/hooks/mouse";
import { useTypewriter } from "@/hooks/typewriter";

const roles = [
  "Sr. Software Engineer",
  "Web Developer",
  "Full Stack Developer",
  "React.JS",
  "Java",
  "JavaScript",
  "TypeScript",
  "MySql",
  "MongoDB",
  "Node.JS",
  "Express.JS",
] as const;

export default function Home() {
  const mouse = useMouse();
  const role = useTypewriter(roles, "Sr. Software Engineer");

  const { x: mx, y: my } = mouse;

  return (
    <main className="relative">
      <Pointer x={mx} y={my} />
      <div className="container">
        <section id="hero" className="min-h-screen flex flex-col justify-center">
          <h1 className={`text-3xl md:text-5xl lg:text-7xl xl:text-7xl font-extrabold`}>Sourabh Malviya</h1>
          <p className="text-xl md:text-3xl lg:text-5xl xl:text-5xl font-bold text-primary italic">
            {role}
            <span className="animate-ping">.</span>
          </p>
        </section>
        {false && (
          <section id="about_me" className="min-h-screen">
            About Me
          </section>
        )}
        {false && (
          <section id="projects" className="min-h-screen">
            Projects
          </section>
        )}
        {false && (
          <section id="blogs" className="min-h-screen">
            Blogs
          </section>
        )}
      </div>
    </main>
  );
}
