---
title: "Spring AI Advisors: Requests, Responses, and Cleanup"
description: "How I use Spring AI advisors to inspect model requests and tool calls, reason about advisor ordering, and place cleanup around synchronous and streaming work."
createdAt: "2026-09-20"
publishedAt: "2026-09-20"
updatedAt: "2026-09-21"
section: "gen-ai"
tags: ["Gen AI", "Spring AI", "Java", "Advisors"]
---

When I send a prompt through `ChatClient`, I want to understand more than the final answer. I want to see which tools the model received, what it requested, and where I can inspect that interaction.

That's where an **advisor** fits. It intercepts a Spring AI `ChatClient` request and its response, giving me a place to add context, inspect the result, or record what happened. It works with Spring AI objects rather than raw HTTP traffic. The [Advisors API](https://docs.spring.io/spring-ai/reference/api/advisors.html) describes those interception points.

I'll use my [tool-search-advisor example](https://github.com/malviys/gen-ai/tree/main/tool-search-advisor) to explain that flow. Here, I'm focusing on observing calls. In the next chapter, I'll walk through [creating and executing tools](/blog/tool-calling).

By [Sourabh Malviya](/about) · Part of [Gen AI](/blog/gen-ai).

> **What I want to make clear**
> - Advisor ordering determines which part of an interaction I can observe.
> - A requested tool call tells me what the model asked for, not whether execution succeeded.
> - Cleanup must account for errors and, with streams, cancellation too.

## Where an advisor runs

I picture the advisor chain as a path to the model and back. The request passes through the advisors on the way in, and the response travels through them in reverse order. With `BaseAdvisor`, `before()` handles the outgoing request and `after()` handles a successful response.

<figure style="max-width: 440px; margin: 2rem auto;">

![A successful call flows from ChatClient through the advisor's before hook, to the LLM through ChatModel, through the advisor's after hook, and back to the application.](/images/blog/spring-ai-advisor/request-response.svg)

</figure>

For this example, I only want to observe the interaction: read the registered tool names before the model sees them, then inspect any tool calls it returns. My logging advisor passes the request and response onward. If I wanted to transform either one, I'd return the changed object instead.

I'm showing one successful model interaction in the diagram. Keep that scope in mind: a single user request can involve several trips to the model when tools are involved.

## Follow the tool-logging example

In the project, `AvailableToolsLoggingAdvisor` implements `BaseAdvisor`. I've kept its [implementation](https://github.com/malviys/gen-ai/blob/main/tool-search-advisor/src/main/java/com/malviys/tool_search_advisor/advisors/AvailableToolsLoggingAdvisor.java) focused on two jobs:

| Hook | What it inspects | What the log tells you |
| --- | --- | --- |
| `before()` | Tool callbacks in `ToolCallingChatOptions` | Which tools are available in that request's options. |
| `after()` | Tool calls in the model response | Which tools the model requested. |

In the [controller](https://github.com/malviys/gen-ai/blob/main/tool-search-advisor/src/main/java/com/malviys/tool_search_advisor/controllers/ChatController.java), I register the advisor and a `DateTimeTools` object on the same request:

```java
return chatClient.prompt()
        .advisors(new AvailableToolsLoggingAdvisor())
        .tools(new DateTimeTools())
        .user("What is the current date and time?")
        .call()
        .content();
```

Here, `chatClient` is the controller's configured client, and both classes come from the example project. I'm using `.advisors(...)` to attach the observer and `.tools(...)` to expose the clock. The tool supplies the time if the model requests it.

**A requested tool call isn't proof of successful execution.** If I see a tool name in `after()`, I know the model asked for it. I'd still check execution logs or the returned result before saying it worked. The final response can contain ordinary text even when earlier responses requested tools.

## Advisor ordering changes what you observe

The next thing I check is `getOrder()`. Lower values run earlier on the request and later on the response. For two advisors with orders `10` and `20`, I read the sequence like this:

```text
Request:  A.before → B.before → model
Response: A.after  ← B.after  ← model
```

I wouldn't give two advisors the same order if their sequence matters. [Advisor ordering](https://docs.spring.io/spring-ai/reference/api/advisors.html#_advisor_order).

Spring AI 2.0 puts the tool loop in `ToolCallingAdvisor`. An observer outside that loop sees the outer interaction; an observer inside it can see each model request and response. That distinction matters when counting tokens: one `ChatClient.call()` can involve several calls to the model. [Tool-loop architecture](https://spring.io/blog/2026/06/15/spring-ai-composable-tool-calling/).

My logging advisor uses order `100`, which places it inside the default tool loop at `HIGHEST_PRECEDENCE + 300`. That's why its hooks can observe the model iterations within that loop.

The [token-log walkthrough](/blog/tool-calling) shows how an advisor inside the loop collects usage across discovery, tool invocation, and the final response.

## Handle cleanup when calls fail

I don't treat `after()` as a cleanup hook. It processes successful responses, so it can't guarantee cleanup if a downstream call throws. If I allocate a resource for a synchronous operation, I'd release it in a `finally` block around the call I own.

<figure style="max-width: 440px; margin: 2rem auto;">

![Start a timer and call the next advisor. On success, process the response; on failure, record the error. Both paths reach finally, where resources are released and timing is recorded, before returning the answer or propagating the error.](/images/blog/spring-ai-advisor/cleanup-lifecycle.svg)

</figure>

Inside a custom `CallAdvisor`, I'd use this method-body pattern:

```java
try {
    var response = chain.nextCall(request);
    // Inspect the successful response.
    return response;
} catch (RuntimeException error) {
    // Record the failure without hiding it.
    throw error;
} finally {
    // Release resources owned by this operation.
    // Record elapsed time for success or failure.
}
```

This is a control-flow sketch, separate from my logging implementation. `chain` and `request` are the arguments supplied to `adviseCall`; the logging advisor in the repository doesn't allocate or release resources this way. [CallAdvisor API](https://docs.spring.io/spring-ai/reference/api/advisors.html#_api_overview).

Streaming changes where I'd put that cleanup. Returning a stream doesn't mean the operation has finished, so a Java `finally` around stream creation runs too early. A reactive termination hook such as `doFinally` can handle completion, error, and cancellation. [Reactor cleanup guide](https://projectreactor.io/docs/core/release/reference/coreFeatures/error-handling.html#_using_resources_and_the_finally_block).

The questions I'd settle first are who owns the resource and what the timer should measure. Timing the whole user request answers a different question from timing each model iteration. Both can be useful, as long as I know which one I'm recording.

That's how I separate the responsibilities: the advisor observes the interaction, the tool performs the requested work, and the code that owns a resource handles its cleanup. In [Spring AI Tool Calling and Tool Search](/blog/tool-calling), I'll build the capability this advisor observes.
