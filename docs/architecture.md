# Architecture

## Backend request flow

```
HTTP request
   │
   ▼
┌──────────────────────────────────────────┐
│ helmet · cors · compression · json       │  security + perf middleware
├──────────────────────────────────────────┤
│ requestId · requestLogger                │  observability
├──────────────────────────────────────────┤
│ Router (/api/v1/...)                     │  routes/*.routes.ts
├──────────────────────────────────────────┤
│ Controller                               │  parse+validate (zod), shape response
├──────────────────────────────────────────┤
│ Service                                  │  business logic, orchestration
├──────────────────────────────────────────┤
│ Repository                               │  data access (in-memory / db)
└──────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────┐
│ notFoundHandler · errorHandler           │  uniform JSON errors
└──────────────────────────────────────────┘
```

**Why this shape?**

- Controllers become dumb glue → easy to test services.
- Services are pure → deterministic, cacheable, easy to reason about.
- Repositories are the only place that knows about persistence → swap in-memory for a real DB by changing one file.

## Frontend architecture

```
main.tsx
  └── <QueryClientProvider>
        └── <ConfigProvider theme={tokens}>
              └── <App>
                    └── <RouterProvider>          (react-router)
                          ├── <MainLayout>        (AntD Layout: sider + header)
                          │     ├── /             → HomePage (lazy)
                          │     └── /users        → UsersPage (lazy)
                          └── <AuthLayout>
                                └── /login        → LoginPage (lazy)
```

**State ownership**

| Kind          | Where                                     | Example                 |
| ------------- | ----------------------------------------- | ----------------------- |
| Server state  | React Query (`@tanstack/react-query`)     | list of users, profile  |
| Global UI     | zustand store in `src/stores/`            | theme, sidebar collapse |
| Local UI      | `useState` / `useReducer` in the component| form open, hover state  |

**Never** put server data in zustand. React Query already handles caching, retries, invalidation.

## Reference feature: `users`

Read the `users` feature end-to-end — it is the canonical example.

- Backend: `models/user.ts`, `repositories/user.repository.ts`, `services/user.service.ts`, `controllers/user.controller.ts`, `routes/user.routes.ts`.
- Frontend: `features/users/{api.ts,types.ts,hooks/useUsers.ts,pages/UsersPage.tsx}`.
