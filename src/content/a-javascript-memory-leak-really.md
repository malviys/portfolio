---
title: "A JavaScript Memory Leak Really…"
description: "Understanding how garbage collection works in Node.js and how a memory leak can happen through closures."
createdAt: "2024-02-15T00:00:00Z"
publishedAt: "2024-02-15T00:00:00Z"
updatedAt: "2024-02-15T00:00:00Z"
tags: ["JavaScript", "Node.js", "Memory Leak", "Garbage Collection"]
---

It is out!
Recently, while working on an application and running a load test, I observed a steady increase in memory consumption by Node.js. It seemed like a memory leak! So, I set out to find the root cause, and the journey taught me a lot.

![Truck pouring water](/images/blog/a-javascript-memory-leak-really/truck.webp)

Let me show you piece of code.

```javascript
function working() {
  const result = [];
  for (let i = 0; i < 1000; i++) {
    result.push(i);
  }
  return result;
}

working();
```

So, the process was allocating some memory but was GC (Garbage Collection) triggered? No!
If we keep doing this, memory footprint will go up, eventually reaching the process memory limit, and then it will crash. So we need to understand how GC works in Node.js.

## How GC works

In Node.js, memory is divided into:

- **New space**: New objects are allocated here. It is generally small in size (1 to 8 MB). Garbage collection runs frequently here (Minor GC or Scavenge).
- **Old space**: Objects that survive minor GC are moved here. GC runs less frequently here (Major GC or Mark-Sweep/Mark-Compact).

The garbage collector starts from a "root" node and finds all the referenced objects. The objects that cannot be reached from the root node are considered "garbage" and their memory is freed.

Wait wait!, what is a root node here?
The answer is global object. In JavaScript, the global objects:

- are Window (in browser) and global (in Node.js).
- Variables declared with `var`, `let`, `const` at the top-level of a module are not added to global object. Wait, what about closure?
- Any references held by closure are considered reachable.

## How can we monitor the GC process in Node.js

Node.js provides a built-in flag `--trace_gc` that we can use to start our application and see garbage collection in action.

```bash
node --trace_gc index.js
```

But reading log prints are hard so we have built-in tool that is v8 Profiler.

```javascript
const profiler = require('v8-profiler-node8');
const fs = require('fs');

profiler.startProfiling('MyProfile');

// function execution goes here

const profile = profiler.stopProfiling('MyProfile');
profile.export((error, result) => {
  fs.writeFileSync('profile.cpuprofile', result);
  profile.delete();
});
```

![V8 Profiler in Chrome DevTools](/images/blog/a-javascript-memory-leak-really/profiler.png)

You can load this file in chrome dev tool.

## Let's see some code now

```javascript
function working() {
  const result = [];
  for (let i = 0; i < 1000; i++) {
    result.push(i);
  }
  return result;
}

setInterval(() => {
  working();
}, 1000);
```

Question is - Is this code a memory leak?
The answer is No.

- `result` is scoped within `working` function. When the function execution is complete, `result` is not referenced by any other object.
- The next time the garbage collection runs, `result` array is safely cleaned up, freeing up memory.

## What is memory leak then?

```javascript
const globalArray = [];

function working() {
  const result = [];
  for (let i = 0; i < 1000; i++) {
    result.push(i);
  }
  globalArray.push(result);
}

setInterval(() => {
  working();
}, 1000);
```

The answer is YES.

- `globalArray` is declared in global scope. Which means it lives for lifetime of application.
- Inside the function `result` is pushed to `globalArray`, making it referenced by root node.
- Every time the function executes, memory grows and it is never freed by garbage collector.

## Let's see one more example

This is interesting, see if you can find the memory leak in this code before you read further.

```javascript
let targetObj = null;

function replaceObj() {
  const originalObj = targetObj;

  const unused = function () {
    if (originalObj) {
      console.log('original obj referenced');
    }
  };

  targetObj = {
    longStr: new Array(1000000).join('*'),
    someObj: function () {
      console.log('some obj referenced');
    }
  };
}

setInterval(replaceObj, 1000);
```

Did you find it?
Well no worries, I will explain it but before that we need to understand a very small and simple concept about "Closure".

"When a function is declared, it contains a lexical scope (which contains all the variables defined in outer scope). To optimize memory allocation, V8 engine shares this lexical scope across all the functions defined in that scope."

In our example code: Both the functions `unused` and `targetObj.someObj` share the same lexical scope.

- `unused` function has reference to `originalObj`. Which means `originalObj` goes to shared lexical scope.
- `targetObj.someObj` also has access to same lexical scope. And this `someObj` is exposed to global scope via `targetObj`.
- Because `targetObj.someObj` is in global scope, it will not be garbage collected. Hence the lexical scope is also not garbage collected.

Wait! But where is the memory leak?
In every next execution of `replaceObj`, `originalObj` holds the reference of `targetObj` from the previous execution.
So, `targetObj` from previous execution -> `someObj` -> `shared lexical scope` -> `originalObj` -> `targetObj` from even previous execution.

And the chain continues, creating a memory leak.

This is a well-known issue of V8 engine. You can read more about it here:
<https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156>

Happy coding!
