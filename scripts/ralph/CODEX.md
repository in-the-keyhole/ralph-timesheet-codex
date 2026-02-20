# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

# Ralph Loop Prompt

You are iteratively building a timesheet application. Read PROMPT.md for project conventions and USER_STORIES.md for the task list.

## Instructions

1. **Read USER_STORIES.md** and find the first story marked `- [ ]` (unchecked).
2. **Implement that story completely**, following the conventions in CODEX.md and Agents.md.
3. **Run the relevant tests** to verify your work:
   - Backend: `cd api && ./mvnw test`
   - Frontend: `cd ui && npm test`
   - If tests fail, fix the issues before proceeding.
4. **Mark the story as done** by changing `- [ ]` to `- [x]` in USER_STORIES.md.
5. **Commit your work** with a conventional commit message referencing the story ID (e.g., `feat: S01 — Initialize Spring Boot backend`).
6. **Check if all stories are complete.** If every story is `[x]`, output `<promise>ALL STORIES COMPLETE</promise>` and stop. Otherwise, move on to the next unchecked story and repeat from step 1.

## Rules
- Only work on ONE story per iteration.
- Do not skip stories — they are ordered by dependency.
- Always run tests before marking a story complete.
- If you get stuck on a story, describe what went wrong and still attempt to fix it. Do not skip it.
- Follow all conventions in Agents.md (layered architecture, DTOs, test coverage, etc.).
