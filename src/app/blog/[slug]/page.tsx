import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/blog";

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Sourabh Malviya`,
    description: post.description,
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: BlogPostProps) {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="relative min-h-[85vh] py-20 sm:py-28">
      {/* Background grain */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      <article className="container mx-auto max-w-3xl px-6">
        <Link
          href="/blog"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Learnings
        </Link>

        <header className="mb-12">
          <time dateTime={post.publishedAt || post.createdAt} className="mb-4 block text-sm font-medium text-primary">
            {new Date(post.publishedAt || post.createdAt || "").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="animate-fade-in-up text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <div className="mt-8 flex flex-wrap gap-2 animate-fade-in-up delay-100">
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Markdown Render Wrapper */}
        <div className="animate-fade-in-up delay-200 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed prose-p:text-muted-foreground prose-pre:bg-muted/50 prose-pre:text-muted-foreground prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
          {post.content.split("```").map((block, index) => {
            // Odd indices in the split array are inside fenced code blocks
            if (index % 2 === 1) {
              const lines = block.split("\n");
              const lang = lines[0].trim();
              const code = lines.slice(1).join("\n");

              return (
                <div key={`${post.slug}-code-${index}`} className="relative group my-8">
                  <div className="absolute right-4 top-4 text-xs font-mono text-muted-foreground bg-muted/80 border border-border backdrop-blur-sm px-2.5 py-1 rounded-md z-10 transition-colors group-hover:bg-muted">
                    {lang || "text"}
                  </div>
                  <pre className="!bg-muted/50 !text-foreground overflow-x-auto p-4 md:p-6 rounded-xl border border-border/50 shadow-sm transition-all duration-300">
                    <code
                      className="!bg-transparent !p-0 !text-inherit text-sm font-mono leading-relaxed"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {code}
                    </code>
                  </pre>
                </div>
              );
            }

            // Even indices are standard paragraphs. Let's further split by \n\n
            return (
              <div key={`${post.slug}-text-${index}`}>
                {block.split("\n\n").map((paragraph, subIndex) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={`h3-${index}-${subIndex}`} className="mt-8 mb-4 text-xl font-bold">
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }

                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={`h2-${index}-${subIndex}`} className="mt-10 mb-4 text-2xl font-bold">
                        {trimmed.replace("## ", "")}
                      </h2>
                    );
                  }

                  if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                    return (
                      <ul
                        key={`ul-${index}-${subIndex}`}
                        className="list-disc pl-6 mb-6 space-y-2 marker:text-primary/50"
                      >
                        {trimmed.split("\n").map((item, itemIndex) => (
                          <li key={`li-${index}-${subIndex}-${itemIndex}`}>{item.replace(/^[*|-]\s*/, "")}</li>
                        ))}
                      </ul>
                    );
                  }

                  const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                  if (imageMatch) {
                    const [, alt, url] = imageMatch;
                    return (
                      <div
                        key={`img-${index}-${subIndex}`}
                        className="my-8 overflow-hidden rounded-xl border border-border shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={alt} className="w-full h-auto object-cover object-center" />
                      </div>
                    );
                  }

                  return (
                    <p key={`p-${index}-${subIndex}`} className="mb-6">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      </article>
    </main>
  );
}
