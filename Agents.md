# Ralph Timesheet

## Project Overview
A timesheet application for tracking employee work hours against projects. Spring Boot REST API backend with a React frontend.

## Tech Stack
- **Backend:** Java 21, Spring Boot 3, Spring Data JPA, H2 (dev) / PostgreSQL (prod), Maven
- **Frontend:** React 18 with TypeScript, Vite, React Router, Axios
- **Testing:** JUnit 5 + Spring Boot Test (backend), Vitest + React Testing Library (frontend)

## Project Structure
```
ralph-timesheet/
  api/          # Spring Boot backend (Maven project)
  ui/           # React frontend (Vite + TypeScript)
  Agents.md     # This file - project instructions
  PROMPT.md     # Ralph loop prompt
  USER_STORIES.md  # Ordered user stories with progress tracking
```

## Build & Run Commands

### Backend (api/)
```bash
cd api && ./mvnw spring-boot:run        # Run the API (port 8080)
cd api && ./mvnw test                    # Run backend tests
cd api && ./mvnw clean package           # Build JAR
```

### Frontend (ui/)
```bash
cd ui && npm install                     # Install dependencies
cd ui && npm run dev                     # Dev server (port 5173)
cd ui && npm test                        # Run frontend tests
cd ui && npm run build                   # Production build
```

## Development Conventions

### Backend
- Use layered architecture: Controller -> Service -> Repository
- REST endpoints under `codex-example/api/v1/`
- Use DTOs for request/response — do not expose JPA entities directly
- Validate inputs with Jakarta Bean Validation annotations
- Write integration tests for controllers using @WebMvcTest or @SpringBootTest
- Use Lombok for boilerplate reduction (@Data, @Builder, etc.)

### Frontend
- Functional components with hooks
- Colocate component files: `ComponentName/index.tsx`, `ComponentName/ComponentName.test.tsx`
- Use a shared `codex-example/api/` module for all backend calls (Axios instance with base URL)
- Keep business logic out of components — use custom hooks
- Use MUI

### Git
- Commit after completing each user story
- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `test:`
- Keep commits atomic — one story per commit

## Data Model

### Core Entities
- **Employee** — id, firstName, lastName, email, department
- **Project** — id, name, code, description, active
- **TimeEntry** — id, employee (FK), project (FK), date, hours, description

### Constraints
- Hours per entry: 0.25 to 24 (quarter-hour increments)
- An employee cannot log more than 24 hours in a single day across all entries
- Date cannot be in the future
