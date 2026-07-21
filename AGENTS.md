# AGENTS.md — Contract for AI Agents

Read this file before touching any code. It is the single source of truth for how work must be done in this repo. When rules here conflict with anything you were told elsewhere, **these rules win**.

## 1. Non-negotiables

- **TypeScript strict everywhere.** No `any`, no `@ts-ignore`, no `as unknown as X` unless you leave a `// WHY:` comment justifying it. Prefer `unknown` + narrowing.
- **Never disable a lint rule to make your code pass.** Fix the code.
- **Never introduce a new dependency without justification.** Prefer stdlib / existing deps. If you must add one, note it in the PR description.
- **All input crossing a trust boundary is validated with `zod`.** Backend: request body/query/params. Frontend: API responses at the client edge.
- **All async code has explicit error handling.** No unhandled rejections. Backend uses the `asyncHandler` wrapper; frontend uses React Query or explicit try/catch.
- **No `console.log` in committed code.** Backend uses `pino` via `logger`; frontend uses `console.warn`/`console.error` only for genuinely unexpected states.

## 2. Layer boundaries

Backend has a strict layering. Higher layers may call lower; lower may not call higher.

```
routes → controllers → services → repositories → (db / external APIs)
                              ↘ models (types + schemas), utils, errors
```

- `routes/*.ts` — Only wire URL + method + middleware + controller. No logic.
- `controllers/*.ts` — Parse & validate request via zod, call service, shape response. Never touch DB.
- `services/*.ts` — Business logic. Pure where possible. Throws typed `AppError` subclasses.
- `repositories/*.ts` — Data access only. Return domain types, not raw rows.
- `middlewares/*.ts` — Cross-cutting: auth, logging, error handler, rate limit.

Frontend uses **feature slices**:

```
features/<feature>/
  components/   # Feature-local components
  hooks/        # useXxx hooks (data + logic)
  pages/        # Route-level components
  api.ts        # Typed API calls for this feature
  types.ts      # Feature-local types
  index.ts      # Public surface
```

Cross-feature imports go through the feature's `index.ts`. Never import from another feature's internals.

## 3. Adding a new backend endpoint (checklist)

1. Add/extend a **zod schema** in `backend/src/models/<domain>.ts`.
2. Add a **repository** method if new data access is needed.
3. Add/extend a **service** method containing the business logic. Write a unit test in `backend/tests/services/`.
4. Add a **controller** that validates input with the zod schema and calls the service.
5. Wire the route in `backend/src/routes/<domain>.routes.ts`. Attach `asyncHandler`.
6. If auth is required, attach `requireAuth` middleware.
7. Add an integration test in `backend/tests/routes/`.

## 4. Adding a new frontend feature (checklist)

1. Create `frontend/src/features/<feature>/`.
2. Define types in `types.ts` (mirror backend zod schemas — do not duplicate freely; import shared contract if possible).
3. Write typed API functions in `api.ts` using the shared `http` client. Validate the response with `zod`.
4. Build data hooks in `hooks/` using **React Query** (`useQuery` / `useMutation`). Never fetch in `useEffect`.
5. Compose pages in `pages/` using AntD components. Keep them thin — logic lives in hooks.
6. Register the route in `frontend/src/routes/index.tsx` with lazy loading (`React.lazy`).
7. Export the public surface from `index.ts`.

## 5. Performance rules

**Backend**

- Use `compression` middleware (already wired) — never disable.
- Never call the DB in a loop; batch or `Promise.all` with a bounded concurrency helper.
- Cache read-heavy, low-cardinality data in a service-level LRU (`lru-cache`) — see `services/example.service.ts`.
- Paginate list endpoints. Default limit 20, max 100.
- Attach `ETag` / `Cache-Control` on GETs of stable resources.

**Frontend**

- Every route is code-split with `React.lazy` — no exceptions.
- Use React Query for server state. Set sensible `staleTime` (default 30s).
- Memoize expensive derived values with `useMemo`; wrap heavy pure components with `React.memo`.
- Use AntD's `virtual` prop for lists > 200 rows (`Table`, `Select`, `List`).
- Use `Form.Item` `shouldUpdate` narrowly — don't re-render whole forms.
- Prefer AntD's built-in components before writing custom ones.

## 6. Error handling

- Backend throws subclasses of `AppError` (`NotFoundError`, `ValidationError`, `UnauthorizedError`, etc.). The global error middleware turns them into structured JSON.
- Never leak stack traces or internal messages in production responses.
- Frontend surfaces errors through AntD's `message.error` / `notification.error` via a single `handleApiError` helper.

## 7. Tests

- Backend: **Vitest** + **supertest** for routes. Every service method needs at least one test. Aim for the golden path + one edge case.
- Frontend: **Vitest** + **@testing-library/react** for components with logic.
- Do not test AntD internals or trivial passthrough components.

## 8. Commits & PRs

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Before finishing a task: `npm run lint && npm run typecheck && npm test` must all pass.
- Never commit generated files, `.env`, or `node_modules`.

## 9. When in doubt

- Read [`docs/conventions.md`](./docs/conventions.md) for details and examples.
- Read the `users` feature end-to-end — it is the reference implementation.
- Prefer boring, readable code over clever code.
