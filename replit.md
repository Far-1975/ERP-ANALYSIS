# ERP Integration Research Analyst

## Overview

A production-grade enterprise AI application that performs multi-level web research on ERP systems and presents the results in an interactive dashboard.

## Architecture

### Frontend (React + Vite)
- **Artifact**: `artifacts/erp-analyst/` at `previewPath: "/"`
- Enterprise OpenText-style dark UI (`#0B1F33` background)
- Left panel: input form (ERP Name, Subscription, Business Type, Website, Credentials, Prompt)
- Right panel: interactive dashboard with 6 tabs (Overview, APIs, Auth, Webhooks, Customization, Deployment)
- Real-time SSE log streaming during analysis
- API modal (Postman-style) with cURL/JS/Python examples, copy buttons
- PDF download button

### Backend (Python Flask)
- **Location**: `backend/` (separate from Node monorepo)
- **Port**: 5000
- Multi-agent orchestration:
  - **Planning Agent** (`backend/agents/planning.py`) — builds search strategy
  - **Research Agent** (`backend/agents/research.py`) — multi-level web crawling with DuckDuckGo + BeautifulSoup
  - **Reasoning Agent** (`backend/agents/reasoning.py`) — extracts APIs, auth, webhooks from content
  - **Validation Agent** (`backend/agents/validation.py`) — normalizes and validates output

### Express API Server (Node.js)
- **Artifact**: `artifacts/api-server/` at `previewPath: "/api"`
- Proxies `/api/erp/*` requests to Flask backend at port 5000
- Handles both regular JSON responses and SSE streaming

## Multi-Level Search Engine

1. **Level 1**: DuckDuckGo targeted search + HTML fallback
2. **Level 2**: Domain filtering (keeps official/trusted sources)
3. **Level 3**: Deep crawling (follows api, auth, webhook, reference links)
4. **Level 4**: Content extraction from crawled pages
5. **Level 5**: Cleaning and deduplication
6. **Level 6**: Regex-based reasoning to extract structured data

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- Flask backend: `cd backend && FLASK_PORT=5000 python3 app.py`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (proxy to Flask)
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python Flask + BeautifulSoup + DuckDuckGo Search
- **Database**: PostgreSQL + Drizzle ORM (available, not used for MVP)

## Workflows

- `Flask Backend` — Python Flask on port 5000
- `artifacts/api-server: API Server` — Express proxy server
- `artifacts/erp-analyst: web` — Vite frontend dev server
