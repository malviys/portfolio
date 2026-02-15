---
description: Pick and manage tasks from prd.json with progress tracking
---

# Pick Task Workflow

Manages tasks from `docs/prd.json` and tracks progress in `docs/progress.json`.

## File Paths

- **PRD**: `docs/prd.json`
- **Progress**: `docs/progress.json`

## Steps

1. **Read `docs/prd.json`** — find the first task with `passes: false`
2. **Review task** — check `steps`, `technical_requirements`, `non_technical_requirements`, `docs`, `assumptions`
3. **Execute steps** — follow each step, referencing docs and validating assumptions
4. **Run tests** — execute each test in `tests` array, verify it passes
5. **Update `docs/progress.json`** — append completion entry:

   ```json
   { "taskId": "{id}", "title": "{title}", "status": "Completed", "stepsCompleted": "{n}/{total}", "testsPassed": "{n}/{total}", "completedAt": "YYYY-MM-DDTHH:MM:SS" }
   ```

6. **Mark complete in `docs/prd.json`** — set `passes: true` on the task and all passing tests

## Task Schema

```json
{
  "id": "string", "passes": false, "title": "string", "description": "string",
  "steps": ["..."], "technical_requirements": ["..."], "non_technical_requirements": ["..."],
  "docs": ["path/to/doc.md"],
  "tests": [{ "id": "string", "title": "string", "description": "string", "passes": false }],
  "assumptions": ["..."]
}
```

## Adding New Tasks

If a task doesn't exist in `docs/prd.json`: generate a unique ID (`task-{n}`), create the task object using the schema above, append to the `tasks` array, then execute steps 3–6.

## Tips

- Always check `technical_requirements` before starting
- Validate `assumptions` hold true
- Reference `docs` for context and patterns
- Update tests incrementally as steps complete
