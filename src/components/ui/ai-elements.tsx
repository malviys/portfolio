"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown, Bot, Check, ChevronDown, Sparkles, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
 * MessageScroller
 * ------------------------------------------------------------------------- */

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean;
}

export const MessageScroller = React.forwardRef<HTMLDivElement, MessageScrollerProps>(
  ({ className, children, autoScroll = true, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative flex-1 min-h-0 w-full overflow-hidden", className)} {...props}>
        {children}
      </div>
    );
  }
);
MessageScroller.displayName = "MessageScroller";

export interface MessageScrollerViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  onScrollToBottom?: () => void;
}

export const MessageScrollerViewport = React.forwardRef<HTMLDivElement, MessageScrollerViewportProps>(
  ({ className, children, onScroll, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = React.useState(true);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setIsAtBottom(distanceFromBottom < 40);
      onScroll?.(e);
    };

    const scrollToBottom = () => {
      const el = internalRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    };

    return (
      <div className="relative h-full w-full">
        <div
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          onScroll={handleScroll}
          className={cn("h-full w-full overflow-y-auto overflow-x-hidden p-4 space-y-4", className)}
          {...props}
        >
          {children}
        </div>

        {!isAtBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            className="absolute bottom-3 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-secondary/90 text-secondary-foreground shadow-md backdrop-blur border border-border/60 hover:bg-secondary transition-all"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
MessageScrollerViewport.displayName = "MessageScrollerViewport";

/* -------------------------------------------------------------------------
 * Message & MessageAvatar & MessageContent
 * ------------------------------------------------------------------------- */

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, align = "start", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full items-start gap-2.5",
          align === "end" ? "flex-row-reverse" : "flex-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Message.displayName = "Message";

export interface MessageAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "user" | "assistant";
}

export const MessageAvatar = React.forwardRef<HTMLDivElement, MessageAvatarProps>(
  ({ className, variant = "assistant", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs shadow-sm",
          variant === "assistant"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground",
          className
        )}
        {...props}
      >
        {variant === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
      </div>
    );
  }
);
MessageAvatar.displayName = "MessageAvatar";

export const MessageContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5 max-w-[85%]", className)} {...props}>
        {children}
      </div>
    );
  }
);
MessageContent.displayName = "MessageContent";

/* -------------------------------------------------------------------------
 * Bubble & BubbleContent
 * ------------------------------------------------------------------------- */

export const bubbleVariants = cva(
  "rounded-2xl px-3.5 py-2.5 text-sm transition-colors break-words shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-tr-sm",
        secondary: "bg-secondary text-secondary-foreground border border-border/60",
        muted: "bg-muted text-foreground border border-border/50",
        ghost: "bg-card text-foreground border border-border/60 rounded-tl-sm",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export interface BubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bubbleVariants> {
  align?: "start" | "end";
}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant, align = "start", children, ...props }, ref) => {
    const computedVariant = variant || (align === "end" ? "default" : "ghost");
    return (
      <div ref={ref} className={cn(bubbleVariants({ variant: computedVariant }), className)} {...props}>
        {children}
      </div>
    );
  }
);
Bubble.displayName = "Bubble";

export const BubbleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("leading-relaxed", className)} {...props}>
        {children}
      </div>
    );
  }
);
BubbleContent.displayName = "BubbleContent";

/* -------------------------------------------------------------------------
 * Trace & TraceCollapsible (Reasoning & Chain of Thought)
 * ------------------------------------------------------------------------- */

export const Trace = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col gap-1 my-1 w-full text-xs", className)} {...props}>
        {children}
      </div>
    );
  }
);
Trace.displayName = "Trace";

export interface TraceCollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
}

export function TraceCollapsible({ className, children, defaultOpen = false, ...props }: TraceCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn("rounded-lg border border-border/50 bg-muted/40 p-2 transition-all", className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 text-left font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span>Thought Process</span>
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="mt-2 pt-2 border-t border-border/40 text-muted-foreground font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Confirmation (Human-in-the-Loop Actions)
 * ------------------------------------------------------------------------- */

export interface ConfirmationProps {
  title: string;
  description?: string;
  onApprove: () => void;
  onReject?: () => void;
  isExecuting?: boolean;
  isComplete?: boolean;
}

export function Confirmation({
  title,
  description,
  onApprove,
  onReject,
  isExecuting = false,
  isComplete = false,
}: ConfirmationProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm space-y-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-xs tracking-tight text-foreground">{title}</h4>
        {isComplete && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
            <Check className="h-3 w-3" /> Done
          </span>
        )}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {!isComplete && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isExecuting}
            onClick={onApprove}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Check className="h-3 w-3" />
            {isExecuting ? "Executing..." : "Approve"}
          </button>
          {onReject && (
            <button
              type="button"
              disabled={isExecuting}
              onClick={onReject}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
