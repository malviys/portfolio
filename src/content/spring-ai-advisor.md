---
title: "Spring AI Advisor"
description: "A simple guide to intercepting LLM requests and responses, with diagrams and a Spring AI tool-logging example."
createdAt: "2026-09-20"
publishedAt: "2026-09-20"
updatedAt: "2026-09-21"
section: "gen-ai"
tags: ["Gen AI", "Spring AI", "Java", "Advisors"]
---

## What is an advisor?

An **advisor** is a hook around a Spring AI `ChatClient` call. It lets you inspect or change the request before it reaches the model, and inspect or change the response before your application receives it.

Think of it as a checkpoint: **do something before the call, let the call happen, then do something afterward.** It works with Spring AI request and response objects, not raw HTTP traffic. [Spring AI documentation](https://docs.spring.io/spring-ai/reference/api/advisors.html).

## Where does it run?

![A successful call flows from ChatClient through the advisor's before hook, to the LLM through ChatModel, through the advisor's after hook, and back to the application.](/images/blog/spring-ai-advisor/request-response.svg)

With `BaseAdvisor`, the two hooks are:

- **`before()`** — inspect the prompt, add context, or log available tools.
- **`after()`** — inspect the response, tidy the answer, or record usage.

When several advisors are registered, requests pass through them in order and responses return in reverse order. A lower `getOrder()` value runs earlier on the request. [Advisor ordering](https://docs.spring.io/spring-ai/reference/api/advisors.html#_advisor_order).

## Example: logging tools

In the [tool-search-advisor project](https://github.com/malviys/gen-ai/tree/main/tool-search-advisor), `AvailableToolsLoggingAdvisor` implements `BaseAdvisor`. It observes the call and returns the request and response unchanged.

| Hook | What the project does |
| --- | --- |
| `before()` | Reads the tool callbacks in the prompt options and logs their names. |
| `after()` | Reads tool-call names from the model response and logs them when present. |

The controller registers the advisor alongside `DateTimeTools`, which exposes a tool for getting the current date and time. Here is a shortened version of the call:

```java
return chatClient.prompt()
        .advisors(new AvailableToolsLoggingAdvisor())
        .tools(new DateTimeTools())
        .user("What is the current date and time?")
        .call()
        .content();
```

**The advisor observes; the tool provides the time.** A tool-call name in a response tells you what the model requested, not whether execution succeeded. A final answer may also have no tool calls after intermediate tool requests have been handled.

Explore the [advisor implementation](https://github.com/malviys/gen-ai/blob/main/tool-search-advisor/src/main/java/com/malviys/tool_search_advisor/advisors/AvailableToolsLoggingAdvisor.java) and [controller](https://github.com/malviys/gen-ai/blob/main/tool-search-advisor/src/main/java/com/malviys/tool_search_advisor/controllers/ChatController.java).

## Cleanup and bookkeeping

The same interception points can handle more than logging:

- **Bookkeeping:** record duration, success or failure, and token usage when available.
- **Response cleanup:** remove unwanted formatting before returning an answer.
- **Resource cleanup:** release temporary resources used during the call.

The example project logs tool names. These are additional behaviors you could build.

![Start a timer and call the next advisor. On success, process the response; on failure, record the error. Both paths reach finally, where resources are released and timing is recorded, before returning the answer or propagating the error.](/images/blog/spring-ai-advisor/cleanup-lifecycle.svg)

**Cleanup must happen even when the call fails.** An `after()` hook alone does not guarantee that. For synchronous calls, a custom `CallAdvisor` can wrap `chain.nextCall(request)` in `try` / `finally`.

This simplified method sketch shows where each action belongs:

```java
try {
    var response = chain.nextCall(request);
    // Inspect the response and record success.
    return response;
} catch (RuntimeException error) {
    // Record the failure.
    throw error;
} finally {
    // Release resources and record elapsed time.
}
```

For streaming calls, cleanup must wait until the stream finishes, fails, or is cancelled. Use a reactive lifecycle hook such as `doFinally` instead of a Java `finally` around stream creation. [Reactor cleanup guide](https://projectreactor.io/docs/core/release/reference/coreFeatures/error-handling.html#_using_resources_and_the_finally_block).

## References

- [Spring AI Advisors API](https://docs.spring.io/spring-ai/reference/api/advisors.html)
- [tool-search-advisor project](https://github.com/malviys/gen-ai/tree/main/tool-search-advisor)
- [Back to Gen AI](/blog/gen-ai)
