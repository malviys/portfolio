---
title: "Gen AI"
description: "My notes on generative AI concepts across languages, starting with Java and Spring AI, with room for examples in TypeScript, Python, and Go."
createdAt: "2026-09-20"
publishedAt: "2026-09-20"
updatedAt: "2026-09-21"
tags: ["Gen AI", "Spring AI", "Java"]
---

I'm learning how to build generative AI applications, and I want to understand what happens after I send a prompt. How does the application give a model access to a tool? Where can I inspect the calls? And what do the token logs actually tell me?

This series is where I'm working through those questions. I'm currently using Java and Spring AI for the examples, and I may add examples in TypeScript, Python, or Go as I explore other stacks. Most of the core generative AI concepts carry across languages; the libraries, APIs, and implementation details change.

I'll connect each concept to code in my [gen-ai repository](https://github.com/malviys/gen-ai), explain the choices in the example, and separate what the results show from what still needs testing. You can follow the ideas even if you work in a different language.

To run the current examples, you'll need basic Java and Spring Boot knowledge and a configured chat model. These chapters use Spring AI 2.0.1 and focus on application code; they don't cover provider credentials or the initial project setup. I'll note the stack and prerequisites for each chapter as the series grows.

By [Sourabh Malviya](/about).

## Chapters

### 01 · [Spring AI Advisors: Requests, Responses, and Cleanup](/blog/spring-ai-advisor)

I start with advisors because I want to see what passes between my application and the model. I'll walk through `before()` and `after()`, explain why ordering changes what gets logged, and show why cleanup needs more than a successful-response hook.

### 02 · [Spring AI Tool Calling and Tool Search](/blog/tool-calling)

Next, I'll turn a Java method into a tool and follow the request through execution. From there, I'll use `ToolSearchToolCallingAdvisor` to discover tools from a larger catalog. I also work through the application's token logs, including why those logs alone don't establish savings over ordinary tool calling.

I'll add chapters and revisit these notes as I learn more. If you're following along from the beginning, start with advisors. If you're here to expose a Java method to a model, the tool-calling chapter is a useful starting point.
