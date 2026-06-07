"use client";

import { InteractiveTabs } from "@/components/ui/interactive-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className="p-1.5 text-muted-foreground bg-muted/80 border border-border backdrop-blur-sm rounded-md transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Copy code"
    >
      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};

const CodeBlock = ({
  match,
  children,
  theme,
  props,
}: {
  match: any;
  children: React.ReactNode;
  theme: string | undefined;
  props: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const codeString = String(children).replace(/\n$/, "");
  const lineCount = codeString.split("\n").length;
  const isLong = lineCount > 15;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center bg-muted/80 backdrop-blur-sm border-b border-border/50 px-4 py-2">
        <span className="text-xs font-mono text-muted-foreground">{match[1]}</span>
        <CopyButton text={codeString} />
      </div>
      <div
        className={`relative overflow-hidden transition-all duration-300 ${!isExpanded && isLong ? "max-h-[350px]" : "max-h-[5000px]"}`}
      >
        <div className="overflow-x-auto p-4 md:p-6">
          <SyntaxHighlighter
            style={theme === "light" ? materialLight : materialDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              background: "transparent",
              padding: 0,
              margin: 0,
            }}
            codeTagProps={{
              className: "!bg-transparent !p-0 !text-inherit text-sm font-mono leading-relaxed",
              style: { fontFamily: "var(--font-mono)" },
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
        {isLong && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
        )}
      </div>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-2 w-full bg-background/50 hover:bg-muted/80 transition-colors py-2.5 text-xs font-medium text-muted-foreground border-t border-border/50"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse code
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand code
            </>
          )}
        </button>
      )}
    </div>
  );
};

const getMarkdownComponents = (theme: string | undefined): any => ({
  h2: ({ node, children, ...props }: any) => {
    const text = String(children || "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return <h2 id={id} className="scroll-mt-28" {...props}>{children}</h2>;
  },
  h3: ({ node, children, ...props }: any) => {
    const text = String(children || "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return <h3 id={id} className="scroll-mt-28" {...props}>{children}</h3>;
  },
  tabs: ({ node, defaultvalue, groupid, value, ...props }: any) => {
    return (
      <Suspense>
        <InteractiveTabs groupId={groupid} defaultValue={defaultvalue} {...props} />
      </Suspense>
    );
  },
  tabslist: ({ node, className, ...props }: any) => <TabsList className={className} {...props} />,
  tabstrigger: ({ node, className, ...props }: any) => <TabsTrigger className={className} {...props} />,
  tabscontent: ({ node, className, ...props }: any) => <TabsContent className={className} {...props} />,
  pre: ({ node, ...props }: any) => (
    <div className="relative group my-8 overflow-hidden rounded-xl border border-border/50 bg-muted/50 shadow-sm transition-all duration-300">
      {props.children}
    </div>
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = inline || !match;

    if (!isInline) {
      return (
        <CodeBlock match={match} theme={theme} props={props}>
          {children}
        </CodeBlock>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img: ({ node, ...props }: any) => (
    <span className="block my-8 overflow-hidden rounded-xl border border-border shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-full h-auto object-cover object-center m-0" alt={props.alt || ""} {...props} />
    </span>
  ),
  link: ({ node, ...props }: any) => (
    <Link className="underline" {...props}>
      {props.children}
    </Link>
  ),
});

export function BlogPostContent({ post }: { post: any }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [structuredSections, setStructuredSections] = useState<{
    id: string;
    text: string;
    level: number;
    items: { id: string; text: string; level: number }[];
  }[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState("introduction");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!post.content) return;

    const lines = post.content.split("\n");
    const sections: {
      id: string;
      text: string;
      level: number;
      items: { id: string; text: string; level: number }[];
    }[] = [];

    // Add Introduction as the default first section
    let currentSection: {
      id: string;
      text: string;
      level: number;
      items: { id: string; text: string; level: number }[];
    } = { id: "introduction", text: "Introduction", level: 2, items: [] };
    sections.push(currentSection);

    lines.forEach((line: string) => {
      if (line.startsWith("## ")) {
        const text = line.replace("## ", "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        currentSection = { id, text, level: 2, items: [] };
        sections.push(currentSection);
      } else if (line.startsWith("### ")) {
        const text = line.replace("### ", "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        currentSection.items.push({ id, text, level: 3 });
      }
    });

    setStructuredSections(sections);
  }, [post.content]);

  useEffect(() => {
    if (structuredSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    const headingElements = document.querySelectorAll("h2[id], h3[id]");
    headingElements.forEach((el) => observer.observe(el));

    const header = document.querySelector("header");
    if (header) {
      header.setAttribute("id", "introduction");
      observer.observe(header);
    }

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
      if (header) observer.unobserve(header);
    };
  }, [structuredSections]);

  useEffect(() => {
    const parentSection = structuredSections.find(
      (sec) => sec.id === activeId || sec.items.some((item) => item.id === activeId)
    );
    if (parentSection) {
      setExpandedSections((prev) => ({
        ...prev,
        [parentSection.id]: true,
      }));
    }
  }, [activeId, structuredSections]);

  const MarkdownComponents = getMarkdownComponents(mounted ? theme : "dark");

  return (
    <main className="relative min-h-[85vh] py-20 sm:py-28">
      {/* Background grain */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

      <div className="container mx-auto max-w-6xl px-6">
        <Link
          href="/blog"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Learnings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 mt-4">
          {/* Table of Contents - Left Column (Desktop only) */}
          <aside className="hidden lg:block sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 border-r border-border/40 w-[250px]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Table of Contents
            </h2>
            <nav className="flex flex-col gap-2">
              {structuredSections.map((section) => {
                const hasItems = section.items.length > 0;
                const isExpanded = expandedSections[section.id];

                return (
                  <div key={section.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between group">
                      <a
                        href={`#${section.id}`}
                        className={`text-sm transition-colors hover:text-foreground flex-grow py-1 pl-2 border-l ${
                          activeId === section.id
                            ? "text-primary font-semibold border-primary"
                            : "text-muted-foreground border-transparent"
                        }`}
                      >
                        {section.text}
                      </a>
                      {hasItems && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedSections((prev) => ({
                              ...prev,
                              [section.id]: !prev[section.id],
                            }));
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-accent/40"
                          aria-label="Toggle subsection"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Collapsible Sub-items */}
                    {hasItems && isExpanded && (
                      <div className="flex flex-col gap-1.5 ml-4 border-l border-border/40 pl-2.5 mt-1 mb-2 animate-fade-in">
                        {section.items.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`text-xs transition-colors hover:text-foreground py-0.5 ${
                              activeId === item.id
                                ? "text-primary font-medium"
                                : "text-muted-foreground/80"
                            }`}
                          >
                            {item.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Post Content - Right Column */}
          <article className="min-w-0">
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
                {post.tags?.map((tag: any) => (
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
            <div className="animate-fade-in-up delay-200 prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed prose-p:text-muted-foreground prose-pre:bg-muted/50 prose-pre:text-muted-foreground prose-pre:border prose-pre:border-border prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none mb-20">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={MarkdownComponents}>
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
