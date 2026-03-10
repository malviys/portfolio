---
title: "A JavaScript Memory Leak. Really…"
description: "Understanding how garbage collection works in Node.js and how a memory leak can happen through closures."
createdAt: "2024-02-15T00:00:00Z"
publishedAt: "2024-02-15T00:00:00Z"
updatedAt: "2024-02-15T00:00:00Z"
tags: ["JavaScript", "Node.js", "Memory Leak", "Garbage Collection"]
---

![Truck pouring water](/images/blog/a-javascript-memory-leak-really/truck.webp)

## Hi, JS Devs

Recently I watched **Theo’s video** on memory leaks, where he delves into an article discussing the suspected causes of this behavior and the role of garbage collection. The following code will result in memory leak and will stay till the execution of application:

```javascript
function allocMemory() {
  const buffer = new ArrayBuffer(100_000_000); // a large buffer in Megabytes
  
  const intervalId = setInterval(() => {
    console.log(buffer.byteLength);
  }, 1000);

  return () => {
    clearInterval(intervalId);
  };
}


const releaseMemory = createMemoryLeak();

releaseMemory();
```

If you have some understanding of JavaScript’s core concepts — such as scoping, hoisting, closures, and memory management — you’ll quickly realize that memory leaks aren’t due to JavaScript’s inability to handle memory. Instead, they often stem from how the code is written and managed.

### Understanding Memory Management in Managed Languages

Before diving into the actual reasons behind memory leaks and how to prevent them, let’s first understand how managed languages like JavaScript, Java, and C# handle memory.

#### Types of Memory

1. **Stack Memory**:
   - **Allocation and Deallocation**: Memory allocation on the stack is straightforward and efficient. When a function call is made, a new frame is pushed onto the call stack, and when the function returns, the frame is popped off, automatically freeing the memory.
   - **Scope**: Variables allocated on the stack are only accessible within the function they are declared in.

2. **Heap Memory**:
   - **Allocation**: Allocating memory on the heap is more complex. The runtime must find a suitable memory segment to fulfill the allocation request.
   - **Deallocation**: After the memory is no longer needed, it must be explicitly released and returned to the memory pool. Failure to do so results in memory leaks, which can degrade application performance.

#### Why Not Allocate Everything on the Stack?

Allocating all memory on the stack isn’t feasible because:

- **Scope Limitation**: Once a function call is complete and its frame is popped off the stack, the memory is no longer accessible.
- **Cost of Copying**: Copying memory to a new location is an expensive operation. Keeping references to memory locations on the heap is a more efficient solution.

### The Garbage Collector

Memory deallocation is a non-deterministic problem, making it difficult to predict when a particular object should be freed and its memory released. Garbage collectors in managed languages like JavaScript, Java, and C# handle this by either counting references to memory or creating a dependency graph. Objects that are not part of this graph are no longer accessible by any references in the program and can be safely deallocated.

#### JavaScript Garbage Collector: Mark and Sweep Algorithm

JavaScript uses the Mark and Sweep algorithm, which consists of two phases:

1. **Mark Phase**:
   - The garbage collector starts with a set of root objects, which are always reachable (e.g., global variables, currently executing functions).
   - It then traverses the object graph, marking all objects that can be reached from the roots. Any object referenced directly or indirectly by a root is marked as “reachable.”

2. **Sweep Phase**:
   - After the mark phase, the garbage collector scans through the memory.
   - Any objects that were not marked as reachable are considered garbage and are thus eligible for memory deallocation.
   - These unmarked objects are then removed, freeing up memory.

#### Generational Garbage Collection in Java and C #

Languages like Java and C# use a generational algorithm for garbage collection. Memory is divided into different segments known as generations:

- 0-Generation: This is where new objects are allocated. With each collection cycle, objects that survive are promoted to the next generation.
- Older Generations (1-Generation & 2-Generation): Objects in these generations are less likely to be cleared and will be retained in memory for a longer period.

0-Generation objects, also known as short-lived objects, are crucial for application performance. To optimize garbage collection:

1. Clean up objects as soon as they go out of scope. Remove references to objects that are no longer needed.
2. This allows the garbage collector to scan smaller memory segments, reducing the time spent on memory collection.

### The Closure

Closure refers to the ability to go beyond imposed limitations in order to find different possibilities.

A closure is a function that has access to its surrounding references. Whenever a function executes, it creates a closure enclosing outer scope references. This behavior allows the function to access variables from its outer scope and maintain state between multiple calls.

#### Key Characteristics of Closures

1. **Scope Access**: Closures can access variables from their own scope, their parent function’s scope, and all the way up to the global scope.
2. **State Maintenance**: Closures can maintain state between multiple function calls. This is useful for creating functions with persistent state.
3. **Variable Binding**: When a closure accesses an outer variable, it binds that variable to the inner scope. This means the variable remains accessible even after the outer function has finished executing. In our case, if we return the inner function from the outer function, all state of the outer function accessible in the inner function will be maintained.

To see how closures work, run this snippet in your browser and open the inspector. Look for the closure in the Sources tab. Notice how the call to cleanup creates a closure with references to the outer scope of allocMemory, retaining both buffer and intervalId even after allocMemory has finished executing.

```javascript
function allocMemory(){
    const buffer = new ArrayBuffer(100_000_000);

    const intervalId = setInterval(() => {
        console.log(buffer.byteLength)
    }, 1000)

    function cleanup() {
        clearInterval(intervalId);
        debugger;
    }

    return cleanup;
}
```

![V8 Profiler in Chrome DevTools](/images/blog/a-javascript-memory-leak-really/profiler.png)

### Let’s Revisit the code in concern

```javascript
function allocMemory() {
  const buffer = new ArrayBuffer(100_000_000); // 1. Allocate 100MB of memory
  
  const intervalId = setInterval(() => {
    console.log(buffer.byteLength); // 2. Log the buffer's byte length every second
  }, 1000);

  return () => {
    clearInterval(intervalId); // 3. Return a function to clear the interval
  };
}

const releaseMemory = allocMemory(); // 4. Call allocMemory and get the cleanup function
releaseMemory(); // 5. Call the cleanup function to clear the interval
```

#### Step-by-Step Explanation

1. **Memory Allocation**:
   The `allocMemory` function creates a buffer of 100MB using `new ArrayBuffer(100_000_000)`.

2. **Logging Interval**:
   It sets up an interval using `setInterval` to log the buffer’s byte length every second.

3. **Cleanup Function**:
   The function returns another function that, when called, clears the interval using `clearInterval(intervalId)`.

4. **Function Call**:
   `allocMemory` is called, which allocates the memory, starts the interval, and returns the cleanup function.

5. **Clearing the Interval**:
   The returned cleanup function is called to clear the interval, stopping the logging.

#### Closures in Action

1. **First Closure (`setInterval`)**:
   The `setInterval` callback function forms a closure over the `buffer` variable. This means the `buffer` remains accessible within the interval function even after `allocMemory` has finished executing.

2. **Second Closure (Return Function)**:
   The returned function forms a closure over the `intervalId` variable. This allows the cleanup function to access and clear the interval even after `allocMemory` has completed.

#### Memory Management Implications

- The setInterval closure retains a reference to the buffer, preventing it from being garbage collected.
- Similarly, the returned function closure holds a reference to intervalId, ensuring the interval can be cleared.
- Additionally, since the cleanup function is accessible in the global scope, the global scope maintains a reference to the cleanup function, which in turn prevents the buffer from being garbage collected.

#### Solution

To break references and allow the garbage collector to free up memory, you can assign the buffer variable to null or undefined in the cleanup function. Here’s the updated code:

```javascript
function allocMemory() {
  let buffer = new ArrayBuffer(100_000_000);
  
  const intervalId = setInterval(() => {
    console.log(buffer.byteLength);
  }, 1000);

  return () => {
    clearInterval(intervalId);
    // remove references and clear memory here
    buffer = null;
  };
}

const releaseMemory = allocMemory();
releaseMemory();
```

### My Key Takeaways

I’ve been writing code in various languages for quite a long time, and I always strive to optimize my work. I never would have thought that this could cause a memory leak. Understanding these concepts now gives me a new perspective on writing optimized code and allows me to revisit and improve my previous projects.

### Reflecting on this experience, here are some important points to remember

1. **Understanding Closures and References**:
   Closures can retain references to variables in their outer scope, which can prevent those variables from being garbage collected. Always be mindful of how closures might unintentionally keep references alive, leading to potential memory leaks.

2. **Continuous Learning**:
   Even with a solid understanding of concepts like garbage collection and closures, there is always more to learn. Stay curious and keep exploring new ways to write efficient and clean code.

3. **Short-Lived Objects**:
   Objects with shorter lifespans are easier for garbage collectors to collect with less effort. When serving user requests, reading files, etc., always try to dereference objects as soon as you are finished with them instead of using global variables. Spending long cycles in garbage collection can degrade application performance.

**That’s all for now. Feel free to correct me if I’ve gotten anything wrong!**
