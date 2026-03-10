import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownComponents: Components = {
  pre: ({ node, ...props }) => (
    <div className="relative group my-8">
      <pre
        className="!bg-muted/50 !text-foreground overflow-x-auto p-4 md:p-6 rounded-xl border border-border/50 shadow-sm transition-all duration-300"
        {...props}
      />
    </div>
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = inline || !match;

    if (!isInline) {
      return (
        <>
          <div className="absolute right-4 top-4 text-xs font-mono text-muted-foreground bg-muted/80 border border-border backdrop-blur-sm px-2.5 py-1 rounded-md z-10 transition-colors group-hover:bg-muted">
            {match[1]}
          </div>
          <code
            className="!bg-transparent !p-0 !text-inherit text-sm font-mono leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
            {...props}
          >
            {children}
          </code>
        </>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img: ({ node, ...props }) => (
    <span className="block my-8 overflow-hidden rounded-xl border border-border shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-full h-auto object-cover object-center m-0" alt={props.alt || ""} {...props} />
    </span>
  ),
};

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
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
