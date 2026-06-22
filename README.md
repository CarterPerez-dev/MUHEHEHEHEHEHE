# MERIT

Upload a resume, get a meritocratic engineering report card. MERIT wraps the
open-source hiring-agent evaluation engine in a full web app: the engine parses
a resume PDF, extracts structured data section by section, optionally enriches
it with public GitHub signal, and scores the candidate across four weighted
categories using an LLM.

- **LLM:** Google Gemini primary, local **Ollama (`qwen2.5:3b`)** automatic
  fallback when Gemini errors or is unavailable.
- **Scoring:** open source (35), self projects (30), production (25),
  technical skills (10), plus bonus and deductions; final score clamped to
  -20..120.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, TypeScript, SCSS modules, zustand, react-query |
| Backend  | FastAPI (async), SQLAlchemy 2, Alembic, JWT auth, slowapi rate limiting |
| Data     | PostgreSQL, Redis |
| LLM      | Gemini API + bundled Ollama container |
| Edge     | nginx (SPA + `/api` reverse proxy), Cloudflare Tunnel |

The hiring-agent engine is vendored at `backend/app/engine/`.

## Quick start (development)

```bash
cp .env.example .env            # only needed for the production stack
just dev-up                     # builds + starts the full dev stack
```

Then open `http://localhost:8440`. The dev stack auto-installs dependencies on
startup (`uv sync` / `pnpm install`), so editing `backend/pyproject.toml` or
`frontend/package.json` is picked up on the next `just dev-up` / restart.

The API container also bundles Ollama and pulls `qwen2.5:3b` on first boot.

### Common tasks

```bash
just                # list all recipes
just dev-logs api   # tail a dev service
just dev-down       # stop the dev stack
just up             # production stack (uses .env)
just tunnel-up      # production + Cloudflare tunnel
just lint           # backend ruff
just fe-typecheck   # frontend tsc
```

## Ports

| Service  | Dev   | Prod        |
|----------|-------|-------------|
| nginx    | 8440  | 8441        |
| api      | 5440  | (internal)  |
| frontend | 9440  | (in nginx)  |
| postgres | 4440  | (internal)  |
| redis    | 6440  | (internal)  |
| ollama   | 11440 | (internal)  |

## Configuration

All config is environment-driven. Key variables (see `.env.example`):

- `GEMINI_API_KEY`, `PRIMARY_MODEL` (default `gemini-2.5-flash`),
  `FALLBACK_MODEL` (default `qwen2.5:3b`)
- `GITHUB_ENRICHMENT` (default off; set a `GITHUB_TOKEN` to make it useful)
- `MAX_UPLOAD_MB`, `RATE_LIMIT_EVALUATE`

Project and container names are structural literals (`merit` / `merit-dev`), so
the dev and production stacks are namespace-isolated and can run side by side.
