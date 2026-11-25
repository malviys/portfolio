"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  Moon,
  RotateCcw,
  Send,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { UniiActionRenderer, useUniiAction, useUniiChat } from "@unii/react";
import type { ChatMessage } from "@unii/sdk";
import { sounds } from "@/lib/sound-effects";
import {
  Bubble,
  BubbleContent,
  Confirmation,
  Message,
  MessageAvatar,
  MessageContent,
  MessageScroller,
  MessageScrollerViewport,
  Trace,
  TraceCollapsible,
} from "@/components/ui/ai-elements";
import { cn } from "@/lib/utils";

function hasRenderableContent(m: ChatMessage) {
  if (m.parts && m.parts.length > 0) {
    return m.parts.some((part) => {
      if (part.type === "text") {
        return Boolean(part.text && part.text.trim().length > 0);
      }
      if (part.type === "reasoning") {
        return Boolean(part.reasoning && part.reasoning.trim().length > 0);
      }
      if (part.type === "tool_call") return Boolean(part.toolCall);
      if (part.type === "citation") return Boolean(part.citation);
      return false;
    });
  }
  if (m.tool_calls && m.tool_calls.length > 0) {
    return true;
  }
  return Boolean(m.content && m.content.trim().length > 0);
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = React.useState(false);
  const [isKnocking, setIsKnocking] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [bottomOffset, setBottomOffset] = React.useState(24);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const prevIsLoadingRef = React.useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme || "dark") : "dark";
  const currentProject = pathname?.startsWith("/project/")
    ? pathname.replace("/project/", "")
    : pathname === "/"
    ? "home"
    : pathname || "home";

  const { messages, sendMessage, isLoading } = useUniiChat();

  React.useEffect(() => {
    setIsMuted(sounds.isMuted());
  }, []);

  // Completion Chime
  React.useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      sounds.playComplete();
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]);

  // Thinking State subtle pulse
  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      sounds.playThinkingPulse();
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Generating stream ticks
  React.useEffect(() => {
    if (isLoading && messages.length > 0) {
      sounds.playGeneratingTick();
    }
  }, [messages, isLoading]);

  // 5-second Inactivity / Idle Timer with Clippy Knock & Speech Bubble
  React.useEffect(() => {
    if (isOpen) {
      setIsBubbleOpen(false);
      return;
    }

    const isDismissed = typeof window !== "undefined" &&
      sessionStorage.getItem("portfolio_chat_bubble_dismissed") === "true";
    if (isDismissed) return;

    let idleTimeout: NodeJS.Timeout | null = null;
    let autoCollapseTimeout: NodeJS.Timeout | null = null;

    const triggerClippy = () => {
      if (isOpen) return;
      setIsKnocking(true);
      sounds.playKnock();

      setTimeout(() => {
        setIsKnocking(false);
        setIsBubbleOpen(true);
        sounds.playBubblePop();

        // Auto-collapse after 14s if visitor ignores it
        autoCollapseTimeout = setTimeout(() => {
          setIsBubbleOpen(false);
        }, 14000);
      }, 650);
    };

    const resetIdleTimer = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      idleTimeout = setTimeout(triggerClippy, 5000);
    };

    resetIdleTimer();

    const handleUserActivity = () => {
      if (!isBubbleOpen) {
        resetIdleTimer();
      }
    };

    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });
    window.addEventListener("scroll", handleUserActivity, { passive: true });
    window.addEventListener("touchstart", handleUserActivity, {
      passive: true,
    });

    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      if (autoCollapseTimeout) clearTimeout(autoCollapseTimeout);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, [isOpen, isBubbleOpen]);

  /* -------------------------------------------------------------------------
   * Screen Actions via useUniiAction
   * ------------------------------------------------------------------------- */

  // 1. Project Navigation Tool
  const navigateProjectDescription = `Navigates the user to a featured project on the portfolio (e.g. lyd, astro-expo, moe-ui, roshi). Currently active page/project is "${currentProject}".`;
  const navigateProjectParameters = React.useMemo(
    () => ({
      type: "object",
      properties: {
        project: {
          type: "string",
          enum: ["lyd", "astro-expo", "moe-ui", "roshi", "all"],
          description: `Identifier of the project to view. Currently active page/project is "${currentProject}".`,
        },
      },
      required: ["project"],
    }),
    [currentProject]
  );

  useUniiAction<{ project: string }>({
    name: "navigate_project",
    description: navigateProjectDescription,
    parameters: navigateProjectParameters,
    requiresApproval: true,
    execute: async (args) => {
      const target = args.project === "lyd" ? "/project/lyd" : "/#projects";
      router.push(target);
      return { success: true, project: args.project, target };
    },
    render: ({ args, status, execute }) => {
      const target = args.project === "lyd" ? "/project/lyd" : "/#projects";
      const projectName = args.project === "lyd"
        ? "LYD — Outfit Generator"
        : args.project === "astro-expo"
        ? "Astro Expo"
        : args.project === "moe-ui"
        ? "Moe UI"
        : args.project === "roshi"
        ? "Roshi"
        : "Featured Projects";

      return (
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              {projectName}
            </span>
            <span className="text-[10px] uppercase font-mono text-muted-foreground">
              {status}
            </span>
          </div>
          <p className="text-muted-foreground">
            Navigate to inspect the details and source for this project.
          </p>
          <div className="pt-1 flex gap-2">
            <button
              type="button"
              disabled={status === "executing"}
              onClick={async () => {
                await execute();
                router.push(target);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {status === "complete" ? "Navigated" : "View Project"}
            </button>
          </div>
        </div>
      );
    },
  });

  // 2. Theme Switching Tool
  const toggleThemeDescription = `Switches the portfolio visual theme to light or dark mode. Current active theme of the application is "${currentTheme}".`;
  const toggleThemeParameters = React.useMemo(
    () => ({
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["light", "dark", "system"],
          description: `Target color theme to activate. Current active theme is "${currentTheme}".`,
        },
      },
      required: ["mode"],
    }),
    [currentTheme]
  );

  useUniiAction<{ mode?: string }>({
    name: "toggle_theme",
    description: toggleThemeDescription,
    parameters: toggleThemeParameters,
    requiresApproval: true,
    execute: async (args) => {
      const targetMode = args?.mode || (currentTheme === "dark" ? "light" : "dark");
      setTheme(targetMode);
      return { success: true, theme: targetMode };
    },
    render: ({ args, status, execute }) => {
      const targetMode = args.mode || (currentTheme === "dark" ? "light" : "dark");
      return (
        <Confirmation
          title={`Switch Theme to ${targetMode}`}
          description={`Change current theme (${currentTheme}) to ${targetMode}.`}
          isExecuting={status === "executing"}
          isComplete={status === "complete"}
          onApprove={async () => {
            await execute();
            setTheme(targetMode);
          }}
        />
      );
    },
  });

  // 3. Contact & Socials Tool
  useUniiAction({
    name: "view_contact",
    description:
      "Displays direct contact links and social profiles for Sourabh Malviya",
    parameters: {
      type: "object",
      properties: {},
    },
    execute: async () => {
      return {
        email: "saurabhmalvia997@gmail.com",
        github: "https://www.github.com/malviys",
        linkedin: "https://www.linkedin.com/in/malviys",
        instagram: "https://www.instagram.com/ma1viys?igsh=MTBuenViejl5MmxsMA==",
      };
    },
    render: () => {
      return (
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm space-y-2 text-xs">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary" />
            Connect with Sourabh
          </div>
          <p className="text-muted-foreground">
            Feel free to reach out directly via email or social networks:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="mailto:saurabhmalvia997@gmail.com"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Email</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/malviys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5 text-primary" />
              <span>LinkedIn</span>
            </Link>
            <Link
              href="https://www.github.com/malviys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5 text-primary" />
              <span>GitHub</span>
            </Link>
            <Link
              href="https://www.instagram.com/ma1viys?igsh=MTBuenViejl5MmxsMA=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-colors"
            >
              <Instagram className="h-3.5 w-3.5 text-primary" />
              <span>Instagram</span>
            </Link>
          </div>
        </div>
      );
    },
  });

  /* -------------------------------------------------------------------------
   * Keyboard & Input Handlers
   * ------------------------------------------------------------------------- */

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  React.useEffect(() => {
    let rafId: number | null = null;

    const updateOffset = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const footer = document.querySelector("footer");
        if (!footer) {
          setBottomOffset(24);
          return;
        }

        const footerRect = footer.getBoundingClientRect();
        const footerVisibleHeight = window.innerHeight - footerRect.top;

        if (footerVisibleHeight > 0) {
          setBottomOffset(footerVisibleHeight + 24);
        } else {
          setBottomOffset(24);
        }
      });
    };

    updateOffset();
    window.addEventListener("scroll", updateOffset, { passive: true });
    window.addEventListener("resize", updateOffset, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateOffset);
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  const handleToggleChat = () => {
    if (isBubbleOpen) {
      setIsBubbleOpen(false);
    }
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      sounds.playBubblePop();
    } else {
      sounds.playDismiss();
    }
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBubbleOpen(false);
    sounds.playDismiss();
    try {
      sessionStorage.setItem("portfolio_chat_bubble_dismissed", "true");
    } catch {}
  };

  const handlePromptClick = async (promptQuery: string) => {
    setIsBubbleOpen(false);
    setIsOpen(true);
    sounds.playSend();
    await sendMessage(promptQuery);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const query = input.trim();
    setInput("");
    sounds.playSend();
    await sendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <style jsx global>
        {`
        @keyframes clippyKnock {
          0%, 100% { transform: scale(1) rotate(0deg); }
          15% { transform: scale(0.95) rotate(-14deg); }
          30% { transform: scale(1.12) rotate(6deg) translateY(-4px); }
          45% { transform: scale(0.96) rotate(-8deg); }
          60% { transform: scale(1.08) rotate(4deg) translateY(-3px); }
          75% { transform: scale(0.98) rotate(-2deg); }
          90% { transform: scale(1.02) rotate(0deg); }
        }
        @keyframes clippyTapRings {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes clippyBubbleSpring {
          0% { transform: scale(0.3) translateY(24px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-3px); opacity: 1; }
          80% { transform: scale(0.98) translateY(1px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .clippy-knock-anim {
          animation: clippyKnock 1.1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .clippy-tap-ring {
          animation: clippyTapRings 0.7s ease-out infinite;
        }
        .clippy-bubble-spring {
          animation: clippyBubbleSpring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}
      </style>

      {/* Proactive Speech Bubble (Clippy-inspired 5s Inactivity Prompt) */}
      {isBubbleOpen && !isOpen && (
        <div
          role="region"
          aria-label="AI Assistant Suggestion"
          style={{ bottom: `${bottomOffset + 68}px` }}
          className={cn(
            "fixed right-4 sm:right-6 z-50 flex flex-col",
            "w-[calc(100vw-2rem)] sm:w-[320px] p-3.5 rounded-2xl",
            "bg-card/95 text-card-foreground border border-border/80 shadow-2xl backdrop-blur-xl",
            "clippy-bubble-spring select-none",
          )}
        >
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <span className="text-sm">👋</span>
              <span>Looking for something specific?</span>
            </div>
            <button
              type="button"
              onClick={handleDismissBubble}
              aria-label="Dismiss suggestion"
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted transition-colors text-xs"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
            Ask me anything about Sourabh&apos;s architecture, featured
            projects, or tech stack!
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <button
              type="button"
              onClick={() =>
                handlePromptClick("Tell me about your featured projects")}
              className="px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-medium transition active:scale-95 border border-primary/20"
            >
              🚀 Featured Projects
            </button>
            <button
              type="button"
              onClick={() =>
                handlePromptClick("What is your tech stack and core skills?")}
              className="px-2.5 py-1 rounded-full bg-muted/60 text-foreground hover:bg-muted text-[10px] font-medium transition active:scale-95 border border-border/60"
            >
              💻 Tech Stack
            </button>
            <button
              type="button"
              onClick={() => handlePromptClick("How can I contact Sourabh?")}
              className="px-2.5 py-1 rounded-full bg-muted/60 text-foreground hover:bg-muted text-[10px] font-medium transition active:scale-95 border border-border/60"
            >
              ✉️ Contact
            </button>
          </div>
          {/* Bubble tail pointing down toward FAB */}
          <div className="absolute -bottom-2 right-8 w-3.5 h-3.5 bg-card border-r border-b border-border/80 transform rotate-45" />
        </div>
      )}

      {/* Floating Trigger Button */}
      <div
        className="fixed right-6 z-50 pointer-events-auto"
        style={{ bottom: `${bottomOffset}px` }}
      >
        {/* Shockwave Rings during screen knock */}
        {isKnocking && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none clippy-tap-ring" />
            <span
              className="absolute inset-0 rounded-full border border-emerald-300 pointer-events-none clippy-tap-ring"
              style={{ animationDelay: "0.2s" }}
            />
          </>
        )}

        <button
          type="button"
          onClick={handleToggleChat}
          aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl",
            "glass border border-primary/30 hover:scale-105 active:scale-95 transition-all duration-200",
            isKnocking && "clippy-knock-anim",
            isOpen
              ? "bg-card text-foreground border-border"
              : "bg-card text-primary dark:text-primary-foreground",
          )}
        >
          {isOpen
            ? <X className="h-5 w-5" />
            : (
              <span className="relative flex items-center justify-center">
                <Sparkles className="h-5 w-5 animate-pulse text-primary dark:text-primary-foreground" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </span>
            )}
        </button>
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Chatbot"
          style={{
            bottom: `${bottomOffset + 72}px`,
            maxHeight: `calc(100vh - ${bottomOffset + 88}px)`,
          }}
          className={cn(
            "fixed right-4 sm:right-6 z-50 flex flex-col",
            "w-[calc(100vw-2rem)] sm:w-[420px] h-[560px]",
            "rounded-2xl border border-border/70 glass shadow-2xl backdrop-blur-xl",
            "animate-in fade-in zoom-in-95 duration-200 overflow-hidden",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/60 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                  Sourabh Malviya AI
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Powered by{" "}
                  <Link href={"https://www.getunii.com"} target="_blank" className="underline text-blue-500">
                    Unii
                  </Link>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextMuted = sounds.toggleMuted();
                  setIsMuted(nextMuted);
                }}
                aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {isMuted
                  ? <VolumeX className="h-4 w-4" />
                  : <Volume2 className="h-4 w-4 text-primary" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  sounds.playDismiss();
                }}
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <MessageScroller className="bg-background/40">
            <MessageScrollerViewport>
              {messages.length === 0
                ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-foreground">
                        Ask anything about Sourabh
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-[280px]">
                        Explore projects, background, technical writings, or ask
                        to navigate across the portfolio.
                      </p>
                    </div>
                  </div>
                )
                : (
                  messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    const isLast = idx === messages.length - 1;
                    const hasContent = hasRenderableContent(m);

                    // Prevent rendering empty assistant placeholders unless currently loading the latest message
                    if (!isUser && !hasContent) {
                      if (isLoading && isLast) {
                        return (
                          <div key={idx} className="space-y-2">
                            <Message align="start">
                              <MessageAvatar variant="assistant" />
                              <MessageContent>
                                <Bubble align="start">
                                  <BubbleContent>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                      <span>Thinking...</span>
                                    </div>
                                  </BubbleContent>
                                </Bubble>
                              </MessageContent>
                            </Message>
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div key={idx} className="space-y-2">
                        <Message align={isUser ? "end" : "start"}>
                          <MessageAvatar
                            variant={isUser ? "user" : "assistant"}
                          />
                          <MessageContent>
                            {/* Structured Parts if available */}
                            {m.parts && m.parts.length > 0
                              ? (
                                m.parts.map((part, pIdx) => {
                                  if (part.type === "reasoning") {
                                    return (
                                      <Trace key={pIdx}>
                                        <TraceCollapsible>
                                          {part.reasoning}
                                        </TraceCollapsible>
                                      </Trace>
                                    );
                                  }

                                  if (part.type === "text") {
                                    return (
                                      <Bubble
                                        key={pIdx}
                                        align={isUser ? "end" : "start"}
                                      >
                                        <BubbleContent>
                                          {isUser
                                            ? (
                                              <p className="whitespace-pre-wrap">
                                                {part.text}
                                              </p>
                                            )
                                            : (
                                              <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed">
                                                <ReactMarkdown>
                                                  {part.text}
                                                </ReactMarkdown>
                                              </div>
                                            )}
                                        </BubbleContent>
                                      </Bubble>
                                    );
                                  }

                                  if (part.type === "tool_call") {
                                    return (
                                      <div
                                        key={part.toolCall.id}
                                        className="w-full"
                                      >
                                        <UniiActionRenderer
                                          toolCall={part.toolCall}
                                        />
                                      </div>
                                    );
                                  }

                                  if (part.type === "citation") {
                                    return (
                                      <div
                                        key={pIdx}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border/60 bg-muted/40 text-[10px] text-muted-foreground font-mono"
                                      >
                                        <span>Source:</span>
                                        <span className="font-medium text-foreground">
                                          {part.citation.documentName}
                                        </span>
                                      </div>
                                    );
                                  }

                                  return null;
                                })
                              )
                              : (
                                <Bubble align={isUser ? "end" : "start"}>
                                  <BubbleContent>
                                    {isUser
                                      ? (
                                        <p className="whitespace-pre-wrap">
                                          {m.content}
                                        </p>
                                      )
                                      : (
                                        <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed">
                                          <ReactMarkdown>
                                            {m.content}
                                          </ReactMarkdown>
                                        </div>
                                      )}
                                  </BubbleContent>
                                </Bubble>
                              )}

                            {/* Fallback for standard tool calls without parts */}
                            {!m.parts &&
                              m.tool_calls?.map((tc) => (
                                <div key={tc.id} className="w-full">
                                  <UniiActionRenderer toolCall={tc} />
                                </div>
                              ))}

                            {/* If reasoning is present but text has not arrived yet while loading, show thinking bubble within the same message */}
                            {isLoading &&
                              isLast &&
                              !isUser &&
                              m.parts &&
                              m.parts.length > 0 &&
                              !m.parts.some((p) =>
                                p.type === "text" && Boolean(p.text?.trim())
                              ) && (
                              <Bubble align="start">
                                <BubbleContent>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                    <span>Thinking...</span>
                                  </div>
                                </BubbleContent>
                              </Bubble>
                            )}
                          </MessageContent>
                        </Message>
                      </div>
                    );
                  })
                )}

              {/* Show standalone Thinking indicator only when loading and no assistant message is in the list yet */}
              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                <Message align="start">
                  <MessageAvatar variant="assistant" />
                  <MessageContent>
                    <Bubble align="start">
                      <BubbleContent>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          <span>Thinking...</span>
                        </div>
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              )}
            </MessageScrollerViewport>
          </MessageScroller>

          {/* Footer Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3 border-t border-border/50 bg-card/60 backdrop-blur"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sounds.playKeyTick();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className={cn(
                "flex-1 min-h-[38px] max-h-24 resize-none rounded-xl px-3 py-2 text-xs",
                "bg-background/80 border border-border/70 placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                "transition-all leading-relaxed",
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                "disabled:opacity-40 disabled:cursor-not-allowed transition-all",
              )}
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
