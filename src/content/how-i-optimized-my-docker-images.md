---
title: "How I Optimized My Docker Images"
description: "A practical guide to shrinking Docker images with layers, multi-stage builds, better base images, Next.js standalone output, and Bun deployment options."
createdAt: "2026-04-13T00:00:00Z"
publishedAt: "2026-04-13T00:00:00Z"
updatedAt: "2026-04-13T00:00:00Z"
tags: ["Docker", "Next.js", "Bun", "DevOps", "Performance"]
---

I used to treat Dockerfiles as a packaging step that came after the real work. If the app ran locally, I would write the quickest Dockerfile possible, ship it, and move on.

That worked until image pulls got slow, CI builds started taking longer than they should, and every tiny source change seemed to rebuild far more than necessary. The fix was not one magic flag. It was understanding what Docker is actually building: layers.

## Layers are the real unit of optimization

A Docker image is not one giant blob. It is a stack of layers.

In practice, every `COPY`, `ADD`, and `RUN` instruction produces filesystem changes that become a new layer. Those layers are immutable: once a layer is built, Docker does not mutate it in place. If something changes, Docker creates a different layer and reuses the old unchanged ones where it can.

That immutability is what makes caching work.

- If a layer does not change, Docker can reuse it.
- If a layer changes, every layer after it has to be rebuilt.
- A container then adds one writable layer on top of the image at runtime.

That one idea changed how I write Dockerfiles. I stopped thinking in terms of "commands" and started thinking in terms of "which layers are expensive, and how often do they change?"

For example, this is a bad order:

```dockerfile
COPY . .
RUN bun install
RUN bun run build
```

Why? Because changing one application file invalidates the `COPY . .` layer, which means the dependency install layer also has to run again.

This is much better:

```dockerfile
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build
```

Now dependency installation is cached until `package.json` or `bun.lock` changes. A normal source edit only rebuilds the later layers.

## A quick note on immutability

When people say Docker layers are immutable, they do not mean containers are read-only. They mean the image layers themselves are content-addressed snapshots. You do not "edit" layer 5. You build a new layer stack that reuses layers 1 through 4 and replaces whatever changed after that.

That matters for both size and speed:

- Reused layers mean faster builds and faster pulls.
- Stable early layers improve CI cache hit rates.
- Smaller final layers reduce the amount of data shipped to registries and servers.

So image optimization is really about controlling how much filesystem data each layer contains, how often it changes, and whether it belongs in the final runtime image at all.

## Staging means multi-stage builds

When I talk about staging here, I mean build stages inside the Dockerfile, not a staging environment.

Multi-stage builds are the cleanest way to separate concerns:

- one stage installs dependencies
- one stage builds the app
- one stage runs the app

The key benefit is simple: the final image only gets the runtime artifacts, not the entire toolchain used to produce them.

Here is the shape I use most often:

```dockerfile
FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

Even that basic pattern is already much better than building and running everything in one stage. It keeps compilers, caches, temporary files, and source-only artifacts out of production.

## Base image choice changes more than image size

Another thing that helped a lot was stopping the habit of blindly using the default base image tag.

For the same runtime, you usually get multiple variants:

- regular or full image
- `slim`
- `alpine`
- distroless images

They are not interchangeable. They trade size, compatibility, and operability against each other.

## Full vs slim vs Alpine vs distroless

### Full images

These are the most forgiving. They include more system packages and usually make debugging easier. They are also the largest and often ship more than your app actually needs.

I use them when I am still figuring out native dependencies or debugging a build.

### Slim images

This is usually my default production starting point.

`slim` keeps the familiar Debian or Ubuntu family userspace but removes a lot of extra packages. That usually gives a noticeable size reduction without changing libc or creating compatibility surprises.

If I want a practical answer instead of the absolute smallest possible image, `slim` is often the best tradeoff.

### Alpine

Alpine images are small, but the smaller number is not free.

The big difference is that Alpine uses `musl` instead of `glibc`. For pure JavaScript apps that may be fine. For apps with native modules, image processing, database drivers, or other prebuilt binaries, that difference can turn into extra work fast.

I only pick Alpine when:

- I know my dependency tree works cleanly on `musl`
- I actually benefit from the smaller footprint
- I am okay trading some convenience for that smaller base

If you switch to Alpine and suddenly need extra compatibility packages or custom rebuild steps, the original size win can disappear quickly.

### Distroless

Distroless images strip the runtime down even further. You usually get the runtime and the minimum libraries needed to execute the app, but no package manager and usually no shell.

That makes distroless attractive for production because:

- the final image is smaller
- the attack surface is smaller
- there is less stuff to accidentally rely on

But there is a cost: debugging inside the container becomes harder. If you are used to dropping into a shell and poking around, distroless will force you to be more intentional.

My rule is:

- use full images while debugging
- use `slim` when I want the safest practical production default
- use Alpine only when I know the stack is compatible
- use distroless when I want a very tight runtime image and operational constraints are acceptable

## The biggest win: do not ship your build toolchain

The most common reason images get big is not the base image alone. It is shipping too much.

Typical waste looks like this:

- source files that are not needed at runtime
- TypeScript sources after compilation
- dev dependencies
- package manager caches
- test files
- build tools
- temporary assets produced during install

This is exactly why multi-stage builds matter. The best optimization is often not "find a smaller base image" but "stop copying unnecessary artifacts into the final stage."

## You can push it further with SlimToolkit

Even after cleaning up the Dockerfile, there is still another layer of optimization available: post-build image minification.

One tool worth knowing here is [SlimToolkit](https://slimtoolkit.org/). The idea is simple: instead of only optimizing the Dockerfile by hand, you can also analyze a built container image and generate a smaller runtime image from it.

According to the official project, SlimToolkit can:

- inspect container images
- minify them with the `build` command
- analyze them with `xray`
- help debug optimized images with `debug`

That is useful because even a well-written multi-stage Dockerfile can still include files, libraries, shells, package manager artifacts, or runtime dependencies that your app never actually touches in production.

A simple workflow looks like this:

```bash
slim build my-image:latest
```

Or before that, if I want to understand what is inside an image first:

```bash
slim xray my-image:latest
```

I think of SlimToolkit as a second pass:

- first, fix the Dockerfile structure
- then, use a tool like SlimToolkit to squeeze out what is still unnecessary

That order matters. SlimToolkit is powerful, but it should not be an excuse for a messy image design. A good multi-stage build, a sensible base image, and the right framework output should come first. Then a slimming pass can reduce things even further.

The tradeoff is that tools like this work best when your runtime behavior is well understood. If your app loads files dynamically, shells out to system tools, or only touches some code paths under rare production traffic, an aggressive minification pass can remove something you actually need later.

So my practical rule is:

- use normal Dockerfile optimization first
- use SlimToolkit when I want an extra reduction pass
- validate the slimmed image with real app traffic, health checks, and critical endpoints before shipping it

For teams chasing every megabyte, or trying to reduce attack surface after the obvious fixes are already done, this can be a very effective final step.

## Next.js: `output: "standalone"` is the easiest high-value optimization

For Next.js, the best Docker-specific optimization I have used is the standalone output.

In `next.config.*`:

```javascript
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
```

When you build with standalone output, Next.js creates a `.next/standalone` directory with the minimal server output and traced runtime dependencies needed to run the app. That changes the final Docker stage completely, because you no longer need to copy the whole project into production.

Instead, the runtime stage can copy just:

- `.next/standalone`
- `.next/static`
- `public`

Here is a practical example:

```dockerfile
FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

That is a major improvement over copying the entire repository and running `next start`.

Two practical notes:

- If you use Next.js image optimization in standalone mode, make sure `sharp` is installed for production builds.
- `standalone` optimizes the server bundle, but it does not excuse a bad layer strategy. You still want lockfiles copied before source files so installs stay cached.

## A brief note on Turborepo

This gets even more useful in a monorepo.

Turborepo is not just a task runner for running builds across packages. In Docker workflows, one of its most useful features is that it can prune a monorepo down to only the files and workspace dependencies needed for a specific app.

That matters because monorepos are easy to accidentally over-copy:

- unrelated apps get included in the build context
- unrelated package changes invalidate cache
- dependency installation ends up considering more workspaces than necessary

With `turbo prune --docker`, Turborepo generates a reduced dependency graph for the target app, which is perfect for multi-stage Docker builds. Instead of copying the whole monorepo into the install stage, you copy the pruned output first, install only what that app needs, and then copy the full pruned source for the build step.

## How that looks in my Next.js + Turborepo Dockerfile

In my case, the flow looks like this:

```dockerfile
FROM oven/bun:1.3.4-alpine AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN bunx turbo prune @work-intelligence/web --docker

FROM base AS builder
COPY --from=prepare /app/out/json .
RUN bun install --frozen-lockfile

COPY --from=prepare /app/out/full .
RUN bunx turbo build

FROM base AS runner
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER bun
EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
```

What I like about this structure:

- the `prepare` stage uses `turbo prune @work-intelligence/web --docker` to isolate only the web app and its required workspace packages
- `out/json` is copied before installation so Bun can cache dependency resolution cleanly
- `out/full` is copied only after dependencies are installed, which avoids reinstalling everything on every source change
- the final runtime stage only gets the standalone server output and static assets

For a Turborepo setup, this is exactly the kind of optimization that makes Docker feel fast again. You are reducing both the monorepo build context and the final runtime payload.

In my case, this kind of optimization brought the Next.js image down from roughly `2 GB` to about `256 MB` uncompressed, and around `65 MB` when compressed for transfer.

## Bun servers have two very different deployment paths

For Bun-based servers, I think about deployment in two buckets.

### 1. Bundle to JavaScript and run with Bun

If I still want the Bun runtime in the final container, I can bundle the entrypoint into a smaller output file and run that.

```bash
bun build src/server.ts --target=bun --outfile dist/server.js
```

That produces a JavaScript bundle optimized for Bun. The final container can then use a Bun base image and ship only the built output plus required assets.

### 2. Compile to a standalone executable

If I want an even tighter runtime story, Bun can compile the app into a standalone executable:

```bash
bun build src/server.ts --compile --outfile dist/server
```

That option is interesting because it changes the runtime image design entirely. Instead of shipping Bun plus your source or bundle, you can copy the compiled binary into a much smaller runtime image.

Conceptually, it looks like this:

```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build src/server.ts --compile --outfile dist/server

FROM debian:bookworm-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist/server ./server
CMD ["./server"]
```

Whether I choose the bundled `.js` output or the compiled binary depends on the server:

- If I want the simplest Bun-native workflow, I ship the bundled `.js` file and run it with Bun.
- If I want the smallest and cleanest runtime artifact, I test `--compile` and ship the executable.

The nice part is that Bun supports both models, so I do not have to force every service into the same container strategy.

## How that looks in my Bun + Turborepo server image

For my server app, I use the same monorepo idea as the Next.js app, but the runtime artifact is even smaller because the build outputs a runnable server binary.

The Dockerfile looks like this:

```dockerfile
FROM oven/bun:1.3.4-alpine AS base
WORKDIR /app

FROM base AS prepare
RUN bun install -g turbo@latest

COPY . .
RUN turbo prune @work-intelligence/server --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN bun install --frozen-lockfile

COPY --from=prepare /app/out/full/ .
RUN bun turbo build

FROM base AS runner
COPY --from=builder /app/apps/server/dist/ .

USER bun
EXPOSE 3001
CMD ["./server"]
```

There are a few nice things happening here:

- the `prepare` stage installs Turbo once and uses `turbo prune @work-intelligence/server --docker` to trim the monorepo to only the server app and the workspaces it depends on
- the `builder` stage installs dependencies from the pruned JSON output first, which gives better cache reuse than copying the entire repository up front
- the full pruned source is copied only after dependency installation, so ordinary code changes do not force a full reinstall
- the `runner` stage copies only the built `dist` output, which keeps the final image much smaller than shipping the whole app source tree

In this setup, Bun is doing double duty for me:

- it is the package manager used during install
- it is also part of the toolchain that produces the final runnable server artifact

And Turborepo is doing exactly what I want in Docker: keeping the build graph focused on one service instead of dragging the whole monorepo into every image build.

For the server image, the result was similarly dramatic: from roughly `1 GB` down to about `165 MB` uncompressed, and around `45 MB` compressed.

## How I check the compressed size

The local Docker image size you usually see is the uncompressed size. But what often matters for registry pushes and remote pulls is the compressed transfer size.

On macOS or Linux, one simple way to get a rough look at that is to export the image and compress it with `gzip`:

```bash
docker save my-image:latest | gzip > my-image.tar.gz
ls -lh my-image.tar.gz
```

If I want the original uncompressed tar size too, I usually do:

```bash
docker save -o my-image.tar my-image:latest
ls -lh my-image.tar
gzip -c my-image.tar > my-image.tar.gz
ls -lh my-image.tar.gz
```

That does not replace registry-side metrics, but it is a quick and practical way to compare "before" and "after" image transfer weight while optimizing locally.

## What actually changed for me

The main improvement was not one specific base image. It was a mindset shift:

1. I optimized for stable early layers.
2. I split build and runtime with multi-stage builds.
3. I chose base image variants intentionally instead of by habit.
4. I shipped only runtime artifacts.
5. For framework-specific stacks, I used the framework's optimized output format instead of copying the whole app.

Once I started doing that, image sizes dropped, CI caching improved, and deployments got less wasteful.

## Final takeaway

If you only remember one thing from this article, let it be this: Docker image optimization starts with understanding layers, not with hunting for the smallest tag on Docker Hub.

Layers are immutable snapshots. Build stages decide what survives into production. Base image variants decide your tradeoff between compatibility, debuggability, and size. And framework-specific outputs like Next.js standalone or Bun's compiled executable can remove a huge amount of unnecessary runtime weight.

That is what finally made my Docker images feel intentional instead of accidental.
