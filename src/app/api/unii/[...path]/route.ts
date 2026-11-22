import { NextRequest, NextResponse } from "next/server";

function getUpstreamBase(): string {
  return (
    process.env.UNII_BASE_URL ||
    process.env.NEXT_PUBLIC_UNII_BASE_URL ||
    "https://api.getunii.com"
  ).replace(/\/+$/, "");
}

function getCorsHeaders(origin: string = "*", requestHeaders?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
    "Access-Control-Allow-Headers":
      requestHeaders ||
      "Content-Type, Authorization, Accept, X-Unii-User-Id, X-Unii-User-Roles, X-Unii-User-Attributes",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const upstreamBase = getUpstreamBase();
  const normalizedPath = pathStr.startsWith("api/") ? pathStr : `api/${pathStr}`;
  const targetUrl = `${upstreamBase}/${normalizedPath}`;

  const origin = req.headers.get("origin") || "*";
  const requestHeaders = req.headers.get("access-control-request-headers");
  const requestMethod = req.headers.get("access-control-request-method") || "POST";

  try {
    // Forward the preflight/OPTIONS request to the upstream Unii server
    const upstreamRes = await fetch(targetUrl, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": requestMethod,
        ...(requestHeaders ? { "Access-Control-Request-Headers": requestHeaders } : {}),
      },
    });

    const responseHeaders = new Headers(upstreamRes.headers);
    const cors = getCorsHeaders(origin, requestHeaders);
    for (const [key, val] of Object.entries(cors)) {
      responseHeaders.set(key, val);
    }

    return new NextResponse(null, {
      status: upstreamRes.status || 204,
      headers: responseHeaders,
    });
  } catch {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin, requestHeaders),
    });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const origin = req.headers.get("origin") || "*";

  const authHeader = req.headers.get("authorization") || "";
  const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  const apiKey =
    process.env.UNII_API_KEY ||
    (rawKey && rawKey !== "dummy-unii-key" ? rawKey : process.env.NEXT_PUBLIC_UNII_API_KEY || "dummy-unii-key");

  const isDummyKey = !apiKey || apiKey === "dummy-unii-key" || apiKey.startsWith("dummy-");

  // Handle auth verify in dummy mode
  if (pathStr.includes("auth/verify") && isDummyKey) {
    return NextResponse.json(
      {
        status: "active",
        keyId: "dev-key",
        keyName: "Portfolio Dev Key",
        organizationId: "org-portfolio",
        projectId: process.env.NEXT_PUBLIC_UNII_PROJECT_ID || "portfolio",
      },
      { headers: getCorsHeaders(origin) }
    );
  }

  // Forward GET request to upstream server
  const upstreamBase = getUpstreamBase();
  const normalizedPath = pathStr.startsWith("api/") ? pathStr : `api/${pathStr}`;
  const targetUrl = `${upstreamBase}/${normalizedPath}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: req.headers.get("accept") || "application/json",
      },
    });

    const resData = await upstreamRes.text();
    return new NextResponse(resData, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
        ...getCorsHeaders(origin),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to connect to Unii backend API", details: String(err) },
      { status: 502, headers: getCorsHeaders(origin) }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const origin = req.headers.get("origin") || "*";

  const authHeader = req.headers.get("authorization") || "";
  const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  const apiKey =
    process.env.UNII_API_KEY ||
    (rawKey && rawKey !== "dummy-unii-key" ? rawKey : process.env.NEXT_PUBLIC_UNII_API_KEY || "dummy-unii-key");

  const isDummyKey = !apiKey || apiKey === "dummy-unii-key" || apiKey.startsWith("dummy-");

  const body = await req.json().catch(() => ({}));
  const isStreaming = Boolean(body.stream);

  // If using dummy key, provide simulated grounded response for development preview
  if (isDummyKey) {
    const userMessage =
      [...(body.messages || [])]
        .reverse()
        .find((m: { role: string; content: string }) => m.role === "user")?.content || "";

    const userLower = userMessage.toLowerCase();

    let replyText =
      "Hello! I'm Sourabh's portfolio AI assistant. I can help answer questions regarding his software engineering experience, full-stack development, mobile apps with React Native, and generative AI systems.";

    // Trigger tool calls if user query matches
    let toolCall: { id: string; type: string; function: { name: string; arguments: string } } | null = null;

    if (userLower.includes("project") || userLower.includes("lyd") || userLower.includes("work")) {
      replyText =
        "Sourabh has built several notable projects including **LYD** (an AI fashion stylist & outfit generator), **Moe UI** (a universal component library bringing shadcn/ui to React Native), and **Astro Expo**.";
      if (userLower.includes("lyd")) {
        toolCall = {
          id: `call_nav_${Date.now()}`,
          type: "function",
          function: {
            name: "navigate_project",
            arguments: JSON.stringify({ project: "lyd" }),
          },
        };
      }
    } else if (userLower.includes("theme") || userLower.includes("dark") || userLower.includes("light")) {
      const mode = userLower.includes("light") ? "light" : "dark";
      replyText = `I can help switch the portfolio theme to ${mode} mode for you.`;
      toolCall = {
        id: `call_theme_${Date.now()}`,
        type: "function",
        function: {
          name: "toggle_theme",
          arguments: JSON.stringify({ mode }),
        },
      };
    } else if (userLower.includes("contact") || userLower.includes("email") || userLower.includes("reach") || userLower.includes("hire")) {
      replyText = "Here are the direct ways you can connect with Sourabh:";
      toolCall = {
        id: `call_contact_${Date.now()}`,
        type: "function",
        function: {
          name: "view_contact",
          arguments: JSON.stringify({}),
        },
      };
    }

    if (isStreaming) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // 1. Send reasoning delta
          const reasoningChunk = {
            id: `chat_${Date.now()}`,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 0,
                delta: {
                  role: "assistant",
                  reasoning: "Retrieved portfolio context for: " + userMessage,
                },
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(reasoningChunk)}\n\n`));

          // 2. Stream tokens in small chunks
          const words = replyText.split(" ");
          for (const word of words) {
            const textChunk = {
              id: `chat_${Date.now()}`,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 0,
                  delta: {
                    content: `${word} `,
                  },
                },
              ],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(textChunk)}\n\n`));
            await new Promise((r) => setTimeout(r, 20));
          }

          // 3. Send tool call if applicable
          if (toolCall) {
            const toolChunk = {
              id: `chat_${Date.now()}`,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: 0,
                  delta: {
                    tool_calls: [toolCall],
                  },
                },
              ],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolChunk)}\n\n`));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          ...getCorsHeaders(origin),
        },
      });
    }

    // Non-streaming response
    return NextResponse.json(
      {
        id: `chat_${Date.now()}`,
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: replyText,
              tool_calls: toolCall ? [toolCall] : undefined,
            },
            finish_reason: "stop",
          },
        ],
      },
      { headers: getCorsHeaders(origin) }
    );
  }

  // Real API key configured -> Proxy to upstream Unii API
  const upstreamBase = getUpstreamBase();
  const normalizedPath = pathStr.startsWith("api/") ? pathStr : `api/${pathStr}`;
  const targetUrl = `${upstreamBase}/${normalizedPath}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: req.headers.get("accept") || "text/event-stream, application/json",
      },
      body: JSON.stringify(body),
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      return new NextResponse(errText, {
        status: upstreamRes.status,
        headers: {
          "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
          ...getCorsHeaders(origin),
        },
      });
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: {
        "Content-Type": upstreamRes.headers.get("Content-Type") || "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...getCorsHeaders(origin),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to connect to Unii backend API", details: String(err) },
      { status: 502, headers: getCorsHeaders(origin) }
    );
  }
}
