---
trigger: always_on
glob: **/*
description: Context retrieval guidelines before picking tasks or starting conversations
---

# Retrieve Context

Before picking a new task or starting a new conversation, always retrieve project context to understand the current state and history.

## Context Sources

### 1. Git History

Use Git to understand recent changes and project evolution:

```bash
# View recent commits (last 10)
git log --oneline -n 10

# View recent changes to specific areas
git log --oneline -n 5 -- src/

# Check current branch and status
git status

# View uncommitted changes
git diff
```

### 2. PRD (Product Requirements Document)

Read `docs/prd.json` to understand:

- All project requirements and tasks
- Task status (`passes: true/false`)
- Technical and non-technical requirements
- Test specifications
- Task assumptions

```bash
cat docs/prd.json
```

**Key information to extract**:

- Incomplete tasks (`passes: false`)
- Recently completed tasks
- Dependencies between tasks
- Technical stack requirements

### 3. Progress Log

Read `docs/progress.txt` to understand:

- Last completed tasks
- Recent updates and changes
- Project timeline
- Implementation history

```bash
# View latest progress entries
tail -n 50 docs/progress.txt

# Or view entire progress log
cat docs/progress.txt
```

## Context Retrieval Workflow

### When Starting a New Conversation

1. **Check Git status**:

   ```bash
   git status
   git log --oneline -n 10
   ```

2. **Read current requirements**:

   ```bash
   cat docs/prd.json
   ```

3. **Check latest progress**:

   ```bash
   tail -n 30 docs/progress.txt
   ```

4. **Identify current state**:
   - What was the last task completed?
   - Are there any incomplete tasks?
   - What's the current branch?
   - Are there uncommitted changes?

### When Picking a New Task

1. **Read full PRD**:

   ```bash
   cat docs/prd.json
   ```

2. **Filter incomplete tasks**:
   - Find tasks with `passes: false`
   - Check task dependencies
   - Review technical requirements

3. **Check related Git history**:

   ```bash
   # If task involves specific files/components
   git log --oneline -- path/to/related/files
   ```

4. **Review progress log for context**:

   ```bash
   grep -i "keyword" docs/progress.txt
   tail -n 30 docs/progress.txt
   ```

## What to Look For

### In Git History

- Recent feature additions
- Bug fixes
- Refactoring patterns
- Commit message patterns
- Active branches

### In prd.json

- Task priorities
- Blocked tasks
- Dependencies
- Required tech stack
- Testing requirements

### In progress.txt

- Implementation patterns
- Common issues encountered
- Task completion timestamps
- Steps that took longer than expected

## Best Practices

- **Always retrieve context** before starting work
- **Don't assume** — verify current state with data
- **Check dependencies** — ensure prerequisites are met
- **Review recent changes** — avoid duplicating work
- **Understand patterns** — maintain consistency with existing work
