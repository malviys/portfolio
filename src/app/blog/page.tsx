import { Metadata } from "next";

import { LearningCard } from "@/components/ui/learning-card";
import { getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Learnings | Sourabh Malviya",
  description: "Thoughts, notes, and lessons learned while building products and exploring new technologies.",
};

export default async function Blog() {
  const learnings = await getBlogPosts();

  return (
    <main className="relative min-h-[85vh] py-20 sm:py-28">
      {/* Background grain */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      <div className="container mx-auto max-w-5xl px-6">
        <header className="mb-16 md:mb-24">
          <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Learnings
          </h1>
          <p className="animate-fade-in-up delay-100 mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Thoughts, notes, and lessons learned while building products and exploring new technologies.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {learnings.map((learning, i) => (
            <div key={learning.slug} className={`animate-fade-in-up delay-${(i + 2) * 100}`}>
              {/* @ts-ignore - Temporary ignore while mapping over old logic, ensuring type matches */}
              <LearningCard {...learning} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
