# Harness Engineering Template

Full-stack template designed as a **safe, well-instrumented harness** for AI coding agents. It ships with strong conventions, guardrails, and reference implementations so that AI-generated code stays consistent, correct, and performant.

**Stack**

- Frontend: React + TypeScript + Vite + Ant Design 5
- Backend: Node.js + Express + TypeScript
- Tooling: ESLint (flat config), Prettier, Vitest, npm workspaces

## Quick Start

```bash
# Install everything (monorepo uses npm workspaces)
npm install

# Run backend (:3001) and frontend (:5173) together
npm run dev

# Lint / typecheck / test
npm run lint
npm run typecheck
npm test
```

Open http://localhost:5173. The frontend proxies `/api` → `http://localhost:3001`.

## Repository Layout

```
.
├── AGENTS.md               # Contract for AI agents working in this repo
├── docs/
│   ├── conventions.md      # Full coding conventions
│   └── architecture.md     # Backend/frontend architecture overview
├── backend/                # Express + TS API server
│   ├── src/
│   │   ├── config/         # env loading, constants
│   │   ├── routes/         # HTTP routing only
│   │   ├── controllers/    # Request/response glue, validation
│   │   ├── services/       # Business logic (pure, testable)
│   │   ├── repositories/   # Data access
│   │   ├── middlewares/    # Cross-cutting concerns
│   │   ├── models/         # Domain types + zod schemas
│   │   ├── utils/          # Small pure helpers
│   │   ├── errors/         # Typed error classes
│   │   ├── app.ts          # Express app assembly (no listen())
│   │   └── server.ts       # Entry point
│   └── tests/
└── frontend/               # React + AntD SPA
    ├── src/
    │   ├── api/            # Typed HTTP client + endpoints
    │   ├── components/     # Reusable presentation components
    │   ├── features/       # Feature-sliced modules (pages + hooks)
    │   ├── hooks/          # Shared hooks
    │   ├── layouts/        # App shells
    │   ├── routes/         # Route table
    │   ├── stores/         # Global state (zustand)
    │   ├── theme/          # AntD theme tokens
    │   ├── types/          # Shared types
    │   ├── utils/          # Pure helpers
    │   └── main.tsx
    └── vite.config.ts
```

## Why this template

AI agents write better code when the harness enforces the rules. This repo:

1. **Encodes conventions in code**, not just docs — ESLint, tsconfig `strict`, path aliases, and layer boundaries do the heavy lifting.
2. **Provides reference implementations** for every layer (see the `users` feature end-to-end).
3. **Uses `AGENTS.md`** to give agents a concise, actionable contract — read it first.
4. **Optimizes for performance by default** — React Query caching, code-splitting routes, gzip on Express, structured logging, request validation at the edge.

See [`AGENTS.md`](./AGENTS.md) and [`docs/conventions.md`](./docs/conventions.md) for the full rules.
