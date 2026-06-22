# =============================================================================
# ©AngelaMos | 2026
# justfile
# =============================================================================

set shell := ["bash", "-uc"]

default:
    @just --list --unsorted

# =============================================================================
# Development (dev.compose.yml + .env.development)
# =============================================================================

[group('dev')]
dev-up *ARGS:
    docker compose -f dev.compose.yml --env-file .env.development up {{ARGS}}

[group('dev')]
dev-start *ARGS:
    docker compose -f dev.compose.yml --env-file .env.development up -d {{ARGS}}

[group('dev')]
dev-down *ARGS:
    docker compose -f dev.compose.yml --env-file .env.development down {{ARGS}}

[group('dev')]
dev-rebuild:
    docker compose -f dev.compose.yml --env-file .env.development build --no-cache

[group('dev')]
dev-logs *SERVICE:
    docker compose -f dev.compose.yml --env-file .env.development logs -f {{SERVICE}}

[group('dev')]
dev-ps:
    docker compose -f dev.compose.yml --env-file .env.development ps

[group('dev')]
dev-shell SERVICE="api":
    docker compose -f dev.compose.yml --env-file .env.development exec {{SERVICE}} /bin/sh

[group('dev')]
dev-migration message:
    docker compose -f dev.compose.yml --env-file .env.development exec api uv run alembic revision --autogenerate -m "{{message}}"

[group('dev')]
dev-migrate:
    docker compose -f dev.compose.yml --env-file .env.development exec api uv run alembic upgrade head

# =============================================================================
# Production (compose.yml + .env)
# =============================================================================

[group('prod')]
up *ARGS:
    docker compose --env-file .env up -d {{ARGS}}

[group('prod')]
down *ARGS:
    docker compose --env-file .env down {{ARGS}}

[group('prod')]
build *ARGS:
    docker compose --env-file .env build {{ARGS}}

[group('prod')]
rebuild:
    docker compose --env-file .env build --no-cache

[group('prod')]
logs *SERVICE:
    docker compose --env-file .env logs -f {{SERVICE}}

[group('prod')]
ps:
    docker compose --env-file .env ps

[group('prod')]
migrate:
    docker compose --env-file .env exec api alembic upgrade head

# =============================================================================
# Production + Cloudflare Tunnel
# =============================================================================

[group('tunnel')]
tunnel-up *ARGS:
    docker compose --env-file .env -f compose.yml -f cloudflared.compose.yml up -d {{ARGS}}

[group('tunnel')]
tunnel-down *ARGS:
    docker compose --env-file .env -f compose.yml -f cloudflared.compose.yml down {{ARGS}}

[group('tunnel')]
tunnel-logs:
    docker compose --env-file .env -f compose.yml -f cloudflared.compose.yml logs -f cloudflared

# =============================================================================
# Backend quality (run on the host via uv)
# =============================================================================

[group('backend')]
lint:
    cd backend && uv run ruff check app/

[group('backend')]
lint-fix:
    cd backend && uv run ruff check app/ --fix && uv run ruff format app/

[group('backend')]
typecheck:
    cd backend && uv run mypy app/

[group('backend')]
test:
    cd backend && uv run pytest tests/

[group('backend')]
lock:
    cd backend && uv lock

# =============================================================================
# Frontend quality (run on the host via pnpm)
# =============================================================================

[group('frontend')]
fe-lint:
    cd frontend && pnpm lint

[group('frontend')]
fe-typecheck:
    cd frontend && pnpm typecheck

[group('frontend')]
fe-build:
    cd frontend && pnpm build
