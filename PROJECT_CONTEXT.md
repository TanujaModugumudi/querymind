# Project Context — AI SQL Query Generator

## Project Name
**QueryMind** — AI-Powered Text-to-SQL Platform

## One-Line Description
A full-stack web app where users type plain English questions and get SQL queries executed against their real database, with results shown as tables and charts.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python + FastAPI |
| ORM | SQLAlchemy |
| LLM | Groq API (LLaMA 3) |
| App Database | PostgreSQL |
| Charts | Chart.js (frontend) |
| Auth | JWT tokens |
| Deployment | Render (free tier) |
| Testing | Pytest + Postman |

---

## Architecture Summary (5 layers)
1. **Frontend (React)** — User types question, sees SQL + result table + chart + history
2. **Backend (FastAPI)** — Receives question, orchestrates schema reading → LLM → execution
3. **Three service modules** — schema_reader.py, llm_service.py, query_executor.py
4. **Two databases** — User's target DB (queried for data) + App DB (stores users, history)
5. **Self-healing loop** — If SQL fails, error is fed back to LLM for auto-correction

## Full Request Flow (example)
User asks: "Show me top 3 customers by total orders"
1. React sends POST /api/query with question + db_connection_id
2. FastAPI receives it
3. schema_reader reads table/column names from user's DB via information_schema
4. llm_service builds prompt (schema + question) → calls Groq API → gets SQL back
5. query_executor runs SQL against user's DB → gets result rows
6. Result + SQL saved to app DB (query_history table)
7. FastAPI returns JSON → React renders table + chart + SQL explanation

---

## Folder Structure
```
querymind/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # SQLAlchemy DB connection (app DB)
│   ├── models.py                # DB table definitions (User, QueryHistory, DBConnection)
│   ├── schemas.py               # Pydantic request/response models
│   ├── auth.py                  # JWT login/register logic
│   ├── routers/
│   │   ├── query.py             # /api/query endpoint
│   │   ├── connections.py       # /api/connections CRUD
│   │   └── history.py           # /api/history endpoint
│   ├── services/
│   │   ├── schema_reader.py     # Reads DB schema via information_schema
│   │   ├── llm_service.py       # Calls Groq API, builds prompt
│   │   └── query_executor.py    # Runs SQL, handles errors, self-healing loop
│   ├── .env                     # API keys (never commit this)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx    # Main query interface
│   │   │   └── History.jsx      # Past queries
│   │   ├── components/
│   │   │   ├── QueryInput.jsx   # Text input + Run button
│   │   │   ├── ResultTable.jsx  # Shows result rows
│   │   │   ├── ChartView.jsx    # Auto chart from results
│   │   │   ├── SqlDisplay.jsx   # Shows generated SQL
│   │   │   └── Sidebar.jsx      # Query history list
│   │   └── api.js               # All fetch() calls to backend
│   ├── index.html
│   └── package.json
├── docker-compose.yml           # Optional: run everything together
└── README.md
```

---

## Database Schema (App DB — PostgreSQL)

### users table
```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name        VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW()
);
```

### db_connections table
```sql
CREATE TABLE db_connections (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    name        VARCHAR(100),          -- friendly name e.g. "My Ecommerce DB"
    host        VARCHAR(255),
    port        INTEGER DEFAULT 5432,
    database    VARCHAR(100),
    db_user     VARCHAR(100),
    db_password VARCHAR(255),          -- encrypt this in production
    created_at  TIMESTAMP DEFAULT NOW()
);
```

### query_history table
```sql
CREATE TABLE query_history (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    connection_id   INTEGER REFERENCES db_connections(id),
    question        TEXT NOT NULL,
    sql_generated   TEXT,
    result_rows     INTEGER,
    was_successful  BOOLEAN DEFAULT TRUE,
    error_message   TEXT,
    executed_at     TIMESTAMP DEFAULT NOW()
);
```

---

## Key Differentiators (for interviews)
1. **Schema introspection** — auto-reads real DB structure, no manual table description needed
2. **Self-healing SQL loop** — catches execution errors, feeds them back to LLM for correction
3. **Two-database architecture** — user's target DB + app's own PostgreSQL
4. **Full product** — auth, multi-DB support, query history, auto charts
5. **Not a prompt wrapper** — executes real SQL against real data

## Testing Strategy (for interviews)
1. Golden query validation — 20 pre-known questions with verified correct answers
2. Self-healing loop testing — deliberate bad queries to test error recovery
3. Schema portability — tested with 3 different DB schemas (ecommerce, HR, sales)
4. API testing — every endpoint tested in Postman
5. Unit tests — pytest for schema_reader and query_executor functions

---

## Build Progress Tracker
- [ ] Step 1 — Folder structure + environment setup
- [ ] Step 2 — Backend: FastAPI app skeleton + database.py + models.py
- [ ] Step 3 — Backend: Auth (register/login with JWT)
- [ ] Step 4 — Backend: schema_reader.py service
- [ ] Step 5 — Backend: llm_service.py (Groq API integration)
- [ ] Step 6 — Backend: query_executor.py (self-healing loop)
- [ ] Step 7 — Backend: /api/query router (connects all services)
- [ ] Step 8 — Backend: /api/connections and /api/history routers
- [ ] Step 9 — Frontend: React setup + Login page
- [ ] Step 10 — Frontend: Dashboard (QueryInput + SqlDisplay + ResultTable)
- [ ] Step 11 — Frontend: ChartView (auto chart from results)
- [ ] Step 12 — Frontend: History page + Sidebar
- [ ] Step 13 — Testing (Postman + pytest)
- [ ] Step 14 — Deployment on Render
- [ ] Step 15 — README + demo DB setup (for interviews)

---

## Environment Variables (.env file)
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/querymind_db
SECRET_KEY=your_jwt_secret_key_here
```

## Current Step
**NOT STARTED — Ready to begin Step 1**

## Code Completed So Far
_(paste code snippets here as we complete each file)_

---

## How to Resume in a New Chat
Paste this entire document and say:
"I am building QueryMind (AI Text-to-SQL app). Here is my project context document.
I have completed up to Step X. Please continue from Step X+1."
