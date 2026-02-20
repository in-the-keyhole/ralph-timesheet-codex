# User Stories

Stories are ordered by dependency. Complete them top-to-bottom.
Mark a story `[x]` when it is fully implemented and tests pass.

---

## Phase 1: Project Scaffolding

- [x] **S01 — Initialize Spring Boot backend**
  Create the `api/` Maven project with Spring Boot 3, Java 21. Include dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-validation, h2 (runtime), lombok, spring-boot-starter-test. Verify the app starts and the health endpoint responds at `/actuator/health`. Include spring-boot-starter-actuator.

- [x] **S02 — Initialize React frontend**
  Create the `ui/` project using Vite with the React + TypeScript template. Install react-router-dom and axios. Configure Vite to proxy `/api` requests to `http://localhost:8080`. Add a simple App component that renders "Timesheet App". Verify `npm run dev` starts and `npm run build` succeeds.

## Phase 2: Data Model & Persistence

- [x] **S03 — Create Employee entity and repository**
  Create the Employee JPA entity (id, firstName, lastName, email, department) in the api project. Create a Spring Data JPA repository. Add a data.sql seed file with 3 sample employees. Write a repository integration test that verifies the seed data loads.

- [x] **S04 — Create Project entity and repository**
  Create the Project JPA entity (id, name, code, description, active). Create a Spring Data JPA repository. Add seed data for 3 sample projects in data.sql. Write a repository integration test.

- [x] **S05 — Create TimeEntry entity and repository**
  Create the TimeEntry entity (id, employee ManyToOne, project ManyToOne, date, hours, description). Create a Spring Data JPA repository with custom query methods: findByEmployeeId, findByProjectId, findByEmployeeIdAndDateBetween. Write repository integration tests.

## Phase 3: REST API

- [x] **S06 — Employee REST endpoints**
  Create EmployeeController with endpoints: GET /api/v1/employees, GET /api/v1/employees/{id}, POST /api/v1/employees, PUT /api/v1/employees/{id}. Use DTOs for request/response. Add input validation. Write controller integration tests for each endpoint.

- [x] **S07 — Project REST endpoints**
  Create ProjectController with endpoints: GET /api/v1/projects (optionally filter by active), GET /api/v1/projects/{id}, POST /api/v1/projects, PUT /api/v1/projects/{id}. Use DTOs, add validation. Write controller integration tests.

- [x] **S08 — TimeEntry REST endpoints**
  Create TimeEntryController with endpoints: GET /api/v1/time-entries (filter by employeeId, projectId, date range), GET /api/v1/time-entries/{id}, POST /api/v1/time-entries, PUT /api/v1/time-entries/{id}, DELETE /api/v1/time-entries/{id}. Use DTOs, add validation. Write controller integration tests.

- [x] **S09 — TimeEntry business validation**
  In the TimeEntry service, enforce: hours must be in 0.25 increments, date cannot be in the future, total hours per employee per day cannot exceed 24. Return clear 400 error messages. Write unit tests for each validation rule.

## Phase 4: React UI — Core Layout

- [x] **S10 — App shell and routing**
  Set up React Router with a layout that includes a sidebar or top nav with links to: Dashboard, Time Entries, Employees, Projects. Add a placeholder page component for each route. Verify navigation works.

- [x] **S11 — API client module**
  Create a shared Axios instance at `ui/src/api/client.ts` with base URL `/api/v1`. Create typed API modules: `employees.ts`, `projects.ts`, `timeEntries.ts` — each exporting functions for the CRUD operations. Define TypeScript interfaces for all DTOs.

## Phase 5: React UI — Features

- [ ] **S12 — Employee list page**
  Build an Employees page that fetches and displays all employees in a table. Include columns: name, email, department. Add a loading indicator and error state.

- [ ] **S13 — Project list page**
  Build a Projects page that fetches and displays all projects in a table. Include columns: name, code, description, active status. Add a loading indicator and error state.

- [ ] **S14 — Time entry form**
  Build a Time Entry form with fields: employee (dropdown), project (dropdown), date (date picker), hours (number input with 0.25 step), description (text). On submit, POST to the API. Show validation errors from the backend. Clear the form on success.

- [ ] **S15 — Time entry list page**
  Build a Time Entries page that shows entries in a table with columns: date, employee name, project name, hours, description. Add filters for employee and date range. Include edit and delete actions per row.

- [ ] **S16 — Dashboard with weekly summary**
  Build a Dashboard page showing the current week's time entries for a selected employee. Display a summary table with rows per day and columns per project, showing hours. Show daily totals and a weekly grand total.

## Phase 6: Polish

- [ ] **S17 — Error handling and loading states**
  Add a global error boundary for the React app. Ensure all API calls have proper loading spinners and user-friendly error messages. Add toast notifications for successful create/update/delete operations.

- [ ] **S18 — Final review and cleanup**
  Ensure all backend tests pass (`./mvnw test`). Ensure all frontend tests pass (`npm test`). Ensure the frontend builds without errors (`npm run build`). Remove any unused code or dead imports. Verify the full workflow: create employee, create project, log time entries, view dashboard.

## Phase 7: API Documentation

- [ ] **S19 — OpenAPI documentation with Swagger UI**
  Add the `springdoc-openapi-starter-webmvc-ui` dependency to the API project. Configure OpenAPI metadata (title, description, version) in application properties or a config class. Annotate all controllers with `@Tag` descriptions. Annotate endpoints with `@Operation` summaries and `@ApiResponse` codes where appropriate. Verify Swagger UI is accessible at `/swagger-ui.html` and the OpenAPI spec is available at `/v3/api-docs`. Write an integration test that fetches the `/v3/api-docs` endpoint and asserts it returns valid JSON containing all expected paths (`/api/v1/employees`, `/api/v1/projects`, `/api/v1/time-entries`).
