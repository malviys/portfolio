import { NextRequest, NextResponse } from "next/server";

const UNII_SERVER_URL = process.env.UNII_SERVER_URL!;
const UNII_API_KEY = process.env.UNII_API_KEY!;
const UNII_PROJECT_ID = process.env.UNII_PROJECT_ID!;

interface IncomingChatMessage {
  role?: string;
  content?: string;
  tool_calls?: unknown;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  // 1. Authenticate the end-user using your own application's session/cookies
  // const user = await getAuthenticatedUserFromSession(req);
  // if (!user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const body = await req.json();

  // Strip tool_calls from history since upstream backend does not support tool history
  const sanitizedMessages = Array.isArray(body.messages)
    ? body.messages
        .filter(
          (msg: IncomingChatMessage) =>
            msg.role === "user" || msg.role === "assistant"
        )
        .map(({ tool_calls: _omittedToolCalls, ...rest }: IncomingChatMessage) => rest)
    : body.messages;

  // 2. Forward request to Unii Server with the secret API Key
  const response = await fetch(`${UNII_SERVER_URL}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${UNII_API_KEY}`,
      "Accept": "text/event-stream, application/json"
    },
    body: JSON.stringify({
      ...body,
      messages: sanitizedMessages,
      projectId: UNII_PROJECT_ID,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return new NextResponse(error, { status: response.status });
  }

  // 3. Pipe the SSE stream or JSON directly back to the browser
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}