# Coding Conventions

Detailed rules. See [`../AGENTS.md`](../AGENTS.md) for the short version.

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- Prefer `type` for unions/aliases, `interface` for object shapes that may be extended.
- All exported functions must have explicit return types.
- Never use non-null assertion `!`. Narrow explicitly.
- Enums are banned — use `as const` object + `keyof typeof`.

```ts
// Good
export const Role = { Admin: 'admin', User: 'user' } as const;
export type Role = (typeof Role)[keyof typeof Role];

// Bad
enum Role { Admin, User }
```

## Naming

- `camelCase` for variables/functions, `PascalCase` for types/components/classes.
- Files: `kebab-case.ts` (backend) or `PascalCase.tsx` for React components.
- Boolean names start with `is/has/should/can`.
- Async functions that fetch data are named `fetchX`, `loadX`, or `getX` — pick one per feature and stick to it.

## Backend

### Structure

```
src/
  config/      env, constants (no logic)
  routes/      Router() factories
  controllers/ (req, res, next) => shape response
  services/    business logic, pure where possible
  repositories/ data access
  middlewares/ cross-cutting
  models/      domain types + zod schemas
  errors/      typed error classes
  utils/       small pure helpers
  app.ts       express app assembly
  server.ts    listen()
```

### Request lifecycle

1. `helmet`, `cors`, `compression`, `express.json({ limit: '1mb' })`.
2. `requestId` middleware attaches `x-request-id`.
3. `requestLogger` logs method, url, status, ms.
4. Route → controller → service → repository.
5. `notFoundHandler` for unmatched routes.
6. `errorHandler` for all thrown errors.

### Validation

Every controller validates input at the boundary:

```ts
const body = createUserSchema.parse(req.body);
```

Never trust `req.body`, `req.query`, or `req.params` without parsing.

### Errors

```ts
throw new NotFoundError('User not found', { userId: id });
throw new ValidationError('Email already exists', { field: 'email' });
```

The error handler turns these into:

```json
{ "error": { "code": "NOT_FOUND", "message": "User not found", "requestId": "..." } }
```

### Performance patterns

- **Bounded concurrency:** use `utils/pMapLimit` instead of `Promise.all` on large arrays.
- **Cache:** service-level LRU (`lru-cache`) with explicit TTL. Never cache user-specific data without a scoped key.
- **Pagination:** every list endpoint accepts `?limit` (default 20, max 100) and `?cursor`.
- **N+1:** repositories expose batch methods (`findByIds`) — use them.

## Frontend

### Structure

- **Feature slices** in `src/features/<name>/` own their pages, hooks, api, types.
- Shared, generic components in `src/components/`. If a component is used by only one feature, keep it inside the feature.
- Global state (auth, theme) in `src/stores/` via zustand. Server state via **React Query**, not zustand.

### Data fetching

- One rule: **React Query for server state.** Never `useEffect(() => fetch(...))`.
- Every query has a stable `queryKey` array: `['users', 'list', filters]`.
- Mutations invalidate related keys explicitly.
- Set `staleTime: 30_000` as default. Override for real-time data.

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['users', 'list', filters],
  queryFn: () => usersApi.list(filters),
  staleTime: 30_000,
});
```

### AntD usage

- Import components individually — tree-shaking works out of the box in AntD 5.
- Wrap the app in a single `<ConfigProvider>` with the theme tokens from `src/theme/`.
- Use `Form` + `useForm()` — don't manage form state manually.
- For tables > 200 rows use `<Table virtual />`.
- Use `App.useApp()` (from `antd`) for `message`/`notification`/`modal` — never call statics directly (they miss theme + context).

### Rendering performance

- Route-level code splitting via `React.lazy` + `<Suspense>`.
- Memoize list items with `React.memo` + stable keys.
- Use `useCallback` only when passing to memoized children — otherwise it's noise.
- Avoid inline object/array literals in props of memoized components.

### Styling

- Prefer AntD tokens (`theme.useToken()`) over hard-coded colors.
- CSS Modules for component-local styles.
- No CSS-in-JS runtime (AntD already ships one; don't add another).

## Testing

### Backend

```
tests/
  services/*.test.ts    unit
  routes/*.test.ts      integration (supertest)
```

- Use `vi.mock` for repositories in service tests.
- Integration tests spin up the app via `createApp()` — no listening port.

### Frontend

```
src/features/<name>/__tests__/*.test.tsx
```

- Render with a `TestProviders` wrapper that provides QueryClient + ConfigProvider.
- Prefer `screen.getByRole` over `getByTestId`.

## Git

- Branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- Commit: Conventional Commits, ≤72-char subject.
- Never force-push shared branches.

## Reviews (for humans reviewing AI output)

Check that:

- [ ] Layer boundaries respected.
- [ ] Input validated at the edge.
- [ ] Errors are typed `AppError` subclasses.
- [ ] No `any`, no `@ts-ignore`.
- [ ] Query keys stable, mutations invalidate correctly.
- [ ] New endpoints have integration tests.
- [ ] No new dependencies without justification.
