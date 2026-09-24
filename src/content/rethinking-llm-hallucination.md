---
title: "Rethinking LLM Hallucination: It's Not Magic, It's Mathematics"
description: "How I think about LLM hallucination: token prediction, missing evidence, ambiguous prompts, and why better context helps without guaranteeing a correct answer."
createdAt: "2025-09-18T00:00:00Z"
publishedAt: "2025-09-18T00:00:00Z"
updatedAt: "2026-09-24T00:00:00Z"
tags: ["LLM", "AI", "Machine Learning", "Prompt Engineering"]
---

![Illustration introducing LLM hallucination](/images/blog/rethinking-llm-hallucination/cover.webp)

When I first started using Large Language Models (LLMs), they felt like magic. You type in a question, and within seconds, there's a beautifully written answer. It almost felt like the machine was thinking by itself.

Later, I heard someone on a podcast describe LLMs as "friendly machines eager to help." That clicked with me. It captured how a confident answer can feel helpful even when it's wrong. But friendliness is a metaphor, not an explanation of how a model works.

The distinction I want to explain is simple: an answer can sound right without being right. An LLM generates language from learned patterns and the context it receives. **LLM hallucination is the generation of false or unsupported content presented as if it were reliable.** Better context can help, but I still need a way to check the answer.

By [Sourabh Malviya](/about).

> **What I keep in mind**
> - Fluent wording doesn't tell me whether an answer is correct.
> - A specific prompt can resolve ambiguity; missing facts still need evidence.
> - Retrieval and tools can supply that evidence, and their results still need checking.

## LLMs are functions, but that isn't the whole explanation

![Conceptual illustration of input being transformed into output](/images/blog/rethinking-llm-hallucination/functions.jpeg)

Thinking of an LLM as a mathematical function makes it less mysterious to me. It takes numerical representations of the context and produces scores for possible next tokens. Tokens can be words, parts of words, or other pieces of text.

A decoding procedure chooses the next token, adds it to the sequence, and repeats until generation stops. The same prompt can produce different responses when sampling is involved.

That doesn't mean a model must invent a factual answer whenever we ask a question. "I don't know" and requests for clarification are possible outputs too. Training and evaluation influence whether a model expresses uncertainty or guesses. [OpenAI's research on why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/) explains how rewarding correct guesses without sufficiently penalizing confident errors can encourage guessing.

For me, the useful distinction is this: producing an answer and establishing that the answer is true are different tasks.

## How token prediction differs from a knowledge lookup

![Conceptual illustration accompanying the explanation of language-model computation](/images/blog/rethinking-llm-hallucination/how-it-works.webp)

A graph with one node for each word or concept is a tempting way to picture a model. I don't think that picture is precise enough to explain what's happening.

The explanation I find more useful starts with token representations passing through layers of learned computation in a transformer. Attention lets those representations incorporate information from other positions in the context. Knowledge isn't a neat dictionary of facts stored one concept per node. The original [Attention Is All You Need paper](https://arxiv.org/abs/1706.03762) describes the attention-based architecture behind this family of models.

This is why I want to check a generated citation or API name before relying on it. The model can produce text that looks like a valid reference. The wording alone doesn't establish that the source or method exists.

The illustrations in this post are conceptual. They aren't diagrams of a model's actual internal representation.

## Specific prompts help with ambiguity

![Illustration of a broad prompt becoming more specific](/images/blog/rethinking-llm-hallucination/specific-prompts.webp)

Take the question I might hear in a viva exam: "What is a register?"

In everyday language, a register might be a record or list. In computer architecture, a CPU register is a small storage location inside the processor. Asking for the CPU meaning resolves the ambiguity.

That is a context problem. Inventing a register name that doesn't exist in a particular processor is a factual error. I shouldn't treat the two as the same thing.

A more useful prompt would be:

```text
Explain what a CPU register does to someone learning computer architecture.
Use a simple example. If you mention a specific processor, identify its
architecture and link to the relevant documentation.
```

The instruction narrows the task. It doesn't guarantee that a generated documentation link is real. If the answer depends on a specific processor, I'd check the manufacturer's manual.

## Better context, retrieval, and training solve different problems

When I compare ways to improve an answer, I separate changes to the prompt from changes to the model itself. Retrieval, tools, and training act at different stages:

| Technique | What changes | What I still need to check |
| --- | --- | --- |
| Clear instructions | The task and constraints in the prompt | Whether the answer follows them and is factually correct |
| Few-shot examples | Examples of the desired response in the context | Whether the pattern fits the new input |
| Retrieval-augmented generation (RAG) | Relevant material is retrieved and supplied to the generator | Whether retrieval found the right material and the answer matches it |
| Tool calling | The application executes a requested operation and returns its result | Whether the right tool ran successfully and its result supports the answer |
| Instruction tuning | Model parameters change through training on instruction-response data | How the trained model behaves on the tasks I care about |

The [original RAG paper](https://arxiv.org/abs/2005.11401) combines a generator with retrieved documents and reports improved factuality against its chosen baseline. That is evidence for the evaluated setup, not a guarantee that every retrieval pipeline produces accurate answers. [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) describes changes made during training, rather than a prompt trick at inference time.

I also wouldn't treat a step-by-step explanation as proof. An incorrect answer can come with convincing intermediate steps. What matters is whether I can verify the evidence and result.

My [Spring AI tool-calling walkthrough](/blog/tool-calling) shows a concrete example: ask a clock tool for the time instead of expecting the model to supply a current value from its learned parameters.

## What I would do in an application

![Illustration accompanying the discussion of checking generated answers](/images/blog/rethinking-llm-hallucination/hallucination.webp)

I'd start by deciding which parts of the answer must be grounded in an external source. For a documentation assistant, that could mean supplying version-specific documentation and asking it to identify the passage behind each important claim.

Then I'd test three cases: the answer is present, the material is ambiguous, and the answer is missing. I'm especially interested in that last case. I want the application to make the gap visible instead of filling it with something plausible.

I'd also inspect the whole interaction. Did retrieval return useful text? Did a tool fail? Did the final response ignore a limitation in its result? My notes on [Spring AI advisors](/blog/spring-ai-advisor) cover observing requests and responses, which is one place to start investigating those questions.

This is the direction I'm exploring in my [Gen AI learning series](/blog/gen-ai): understanding the application around the model, as well as the prompt we send to it.

## What changed in my thinking

![Closing illustration for the article](/images/blog/rethinking-llm-hallucination/final-thoughts.webp)

Thinking about the computation takes away some of the mystery for me. It doesn't give me a shortcut for checking the output.

My takeaway is that I need to diagnose the failure before choosing the fix. An unclear question needs clarification. A missing fact needs a reliable source. And a confident answer still needs checking, even when I've supplied both.

And if this article doesn't make any sense… well, just assume it's my own little hallucination. 😉
