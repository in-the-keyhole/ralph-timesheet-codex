# Ralph Timesheet

A timesheet application for tracking employee work hours against projects — built as a **Ralph Loop experiment** to demonstrate how an AI agent can autonomously scaffold, implement, test, and iterate on a full-stack application from a set of user stories.

**This is not intended to be a production product.** Its purpose is to showcase the setup and execution of an AI-driven development workflow using Codex and the Ralph Loop plugin.

## What Is Ralph Loop?

[Ralph Loop](https://github.com/anthropics/claude-code-plugins) is a Codex plugin that enables an autonomous development loop. Once started, Codex reads a prompt file, executes the instructions, and repeats — allowing it to work through a sequence of tasks without manual intervention. In this project, Ralph Loop iterated through 19 user stories, implementing each one end-to-end: writing code, running tests, committing, and moving on to the next story.

## How the Project Was Executed

The project was driven by three Markdown files that together define the requirements, conventions, and execution loop:

### [`Agents.md`](Agents.md) — Project Instructions

This is Codex Code's project-level instruction file. It is automatically loaded at the start of every session and tells the agent:

- **Tech stack** — Java 21, Spring Boot 3, React + TypeScript, Vite, H2/PostgreSQL
- **Project structure** — `api/` for the backend, `ui/` for the frontend
- **Build and run commands** — Maven for the backend, npm for the frontend
- **Development conventions** — layered architecture, DTOs, validation, test expectations, commit message format, MUI for the UI
- **Data model** — Employee, Project, and TimeEntry entities with their constraints

This file acts as the "coding standards" document that the agent follows throughout the entire build.

### [`USER_STORIES.md`](USER_STORIES.md) — Task Backlog

A prioritized, dependency-ordered list of 19 user stories grouped into phases:

1. **Project Scaffolding** (S01–S02) — Initialize the Spring Boot backend and React frontend
2. **Data Model & Persistence** (S03–S05) — JPA entities, repositories, and seed data
3. **REST API** (S06–S09) — CRUD endpoints with DTOs, validation, and business rules
4. **React UI — Core Layout** (S10–S11) — Routing, navigation, and API client module
5. **React UI — Features** (S12–S16) — Employee/project lists, time entry CRUD, dashboard
6. **Polish** (S17–S18) — Error handling, loading states, toast notifications, final cleanup
7. **API Documentation** (S19) — OpenAPI/Swagger integration

Each story has a checkbox. The agent marks a story `[x]` after it is implemented and tests pass, then moves on to the next unchecked story.

### [`PROMPT.md`](PROMPT.md) — Ralph Loop Prompt

The instructions that Ralph Loop feeds to Codex  on each iteration. It defines a simple cycle:

1. Read `USER_STORIES.md` and find the first unchecked story
2. Implement it following the conventions in `Agents.md`
3. Run the relevant tests (backend and/or frontend)
4. Mark the story done in `USER_STORIES.md`
5. Commit with a conventional commit message
6. If all stories are complete, stop; otherwise repeat

Rules enforce that stories are completed one at a time, in order, with passing tests before each commit.

## Starting the Ralph Loop

### Prerequisites


2. The Ralph Loop plugin enabled for the project




If starting a new project, you can enable it by running `/install-plugin ralph-loop` inside a codex session.

### Step 2: Configure Permissions

To let the loop run autonomously without prompting for every command, configure allowed tool permissions in `.codex/settings.local.json`. This project pre-approves commands like `./mvnw`, `npm`, and `git`:

```json
{
  "permissions": {
    "allow": [
      "Bash(cd api && ./mvnw:*)",
      "Bash(cd ui && npm:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ]
  }
}
```

Without these, Codex will pause and ask for approval on each shell command, breaking the autonomous flow.

### Step 3: Prepare the Prompt and Stories

Ensure the project root contains:

- **`PROMPT.md`** — the loop instructions (what to do on each iteration)
- **`USER_STORIES.md`** — the ordered task list with unchecked `- [ ]` items
- **`Agents.md`** — project conventions the agent should follow

### Step 4: Kick Off the Loop

Open a CodexCode session in the project directory and run:

```
/ralph-loop "Follow the instructions in PROMPT.md" --completion-promise "ALL STORIES COMPLETE" --max-iterations 50
```

The command takes three parts:

- **Prompt** (required) — the instruction fed to Codex on every iteration. It points at `PROMPT.md`, which tells the agent to find the next unchecked story, implement it, run tests, and commit.
- **`--completion-promise`** — the phrase that signals the loop should stop. In `PROMPT.md`, the agent is instructed to output `<promise>ALL STORIES COMPLETE</promise>` only after the final story is checked off. The loop detects this and exits.
- **`--max-iterations`** — a safety cap to prevent runaway loops if something goes wrong. Set this higher than the number of stories (e.g., 50 for 19 stories) to allow room for retries on failures.

**How the iterations work:** On each cycle, Codex receives the same prompt, sees its own prior work in the files and git history, and follows `PROMPT.md` — which directs it to find the first `- [ ]` story in `USER_STORIES.md`, implement it, and mark it `[x]`. If unchecked stories remain, the iteration ends, the stop hook intercepts, and the same prompt is fed again. Codex then picks up the next unchecked story. This continues story-by-story until all are complete, at which point `PROMPT.md` tells the agent to emit the completion promise and the loop stops.

To cancel a running loop early, use:

```
/cancel-ralph
```

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Backend  | Java 21, Spring Boot 3, Spring Data JPA, H2, Maven |
| Frontend | React 19, TypeScript, Vite, MUI, React Router, Axios |
| Testing  | JUnit 5 / Spring Boot Test (backend), Vitest / React Testing Library (frontend) |
| API Docs | springdoc-openapi, Swagger UI                   |

## Running the Application

### Backend
```bash
cd api && ./mvnw spring-boot:run        # Start API on port 8080
cd api && ./mvnw test                    # Run backend tests
```

### Frontend
```bash
cd ui && npm install                     # Install dependencies
cd ui && npm run dev                     # Dev server on port 5173
cd ui && npm test                        # Run frontend tests
```

### Swagger UI

With the backend running, visit [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) for interactive API documentation.

## Commit History

Each commit corresponds to a completed user story, following conventional commit format:

```
feat: S01 — Initialize Spring Boot backend
feat: S02 — Initialize React frontend
feat: S03 — Create Employee entity and repository
...
feat: S19 — OpenAPI documentation with Swagger UI
```

This 1:1 mapping between stories and commits makes it straightforward to trace any piece of functionality back to the requirement that produced it.

## Try It Yourself

You can re-run the entire build from scratch to see Ralph Loop in action. The only things the loop needs are the Markdown files and the plugin configuration — everything else gets generated.

1. **Clone the repo and remove the generated code:**

   ```bash
   git clone <this-repo>
   cd ralph-timesheet
   rm -rf api/ ui/
   ```

   Keep the following files intact:
   - `Agents.md` — project conventions
   - `PROMPT.md` — loop instructions
   - `USER_STORIES.md` — task backlog
   - `.codex/` — plugin enablement and permissions

2. **Reset the story checkboxes** in `USER_STORIES.md` — change every `- [x]` back to `- [ ]` so the loop has work to do.

3. **Start a Codex session** in the project directory and kick off the loop:

   ```
   /ralph-loop "Follow the instructions in PROMPT.md" --completion-promise "ALL STORIES COMPLETE" --max-iterations 50
   ```

4. **Watch it build.** code will scaffold both projects, create entities, build the REST API, wire up the React UI, add tests, and commit each story — all autonomously.

The result won't be identical to the version in this repo (the agent may make different implementation choices), but it will follow the same conventions and satisfy the same user stories.
