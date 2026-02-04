# Repository Guidelines

## Project Structure & Module Organization

- `src/main/java/` and `src/main/resources/` contain the Spring Boot backend (package `com.amit.smartreconciliation`).
- `src/test/java/` holds backend tests.
- `frontend/` contains the React + TypeScript app (`frontend/src/`) plus build output in `frontend/dist/`.
- `frontend/test-specs/` includes Markdown-based UI test specifications.
- `docs/` is organized into numbered folders (e.g., `docs/03-development/`, `docs/06-testing/`). Never place new docs in `docs/` root.
- `compose.yaml` defines PostgreSQL + PGVector for local dev.

## Build, Test, and Development Commands

Backend (Maven Wrapper):
- `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows): run the API on `http://localhost:8080`.
- `./mvnw test`: run backend tests.
- `./mvnw clean package`: full build.
- `./mvnw compile`: compile-only sanity check.

Frontend (from `frontend/`):
- `npm run dev`: start Vite dev server.
- `npm run build`: typecheck + production build.
- `npm run lint`: ESLint checks.

Infrastructure:
- `docker-compose up -d`: start PostgreSQL + PGVector.
- `docker-compose down`: stop services.

## Coding Style & Naming Conventions

- Java 21 + Spring Boot 3.5.10. Follow existing class and package conventions in `src/main/java/`.
- Frontend is React + TypeScript. Keep code aligned with existing patterns and run `npm run lint` before PRs.
- Use descriptive branch names like `feature/add-csv-parser` or `fix/null-pointer-exception`.
- Prefer concise, intention-revealing names for services, controllers, and DTOs.

## Testing Guidelines

- Backend uses Spring Boot testing (`spring-boot-starter-test`); place tests under `src/test/java/` and name them consistently with the class under test.
- Frontend test plans live in `frontend/test-specs/` as Markdown; follow those specs when adding UI features.
- Run `./mvnw test` before submitting changes.

## Commit & Pull Request Guidelines

Commit messages follow:
- `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`
- Optional body and `Co-Authored-By` line as shown in `CONTRIBUTING.md`.

PRs should include:
- A clear description, testing notes, and any docs updates.
- Confirmation that docs are in the correct `docs/` subfolder (never in `docs/` root).
- No build warnings; tests pass.

## Configuration & Security Notes

- Copy `.env.example` to `.env` for local config.
- AI provider keys can be set in `src/main/resources/application.properties` or environment variables.
- Do not commit secrets or generated artifacts from `target/` or `frontend/dist/`.
