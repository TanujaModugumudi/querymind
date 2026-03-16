# QueryMind — AI-Powered Text-to-SQL Platform

> Ask your database anything in plain English. Get SQL + Results + Charts instantly.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-querymind--frontend.onrender.com-00d4ff?style=for-the-badge)](https://querymind-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/API%20Docs-Swagger%20UI-7c6af7?style=for-the-badge)](https://querymind-backend-kzd8.onrender.com/docs)
[![GitHub](https://img.shields.io/badge/GitHub-TanujaModugumudi-white?style=for-the-badge&logo=github)](https://github.com/TanujaModugumudi/querymind)

---

## What is QueryMind?

QueryMind is a full-stack AI web application that lets users query any PostgreSQL
database using plain English — no SQL knowledge required.

Type a question like **"Show me top 5 customers by total spending"** and QueryMind:
1. Automatically reads your database schema
2. Generates the correct SQL using Groq LLaMA AI
3. Executes it against your real database
4. Returns results as a table + auto-generated chart
5. Explains what the query does in plain English

---

## Screenshots

### Dashboard — Ask anything in plain English
![Dashboard](screenshots/dashboard.png)

### AI-Generated SQL with Plain English Explanation
![SQL Generation](screenshots/sql_generation.png)

### Auto-Generated Charts from Query Results
![Charts](screenshots/charts.png)

### Query History — Every query logged
![History](screenshots/history.png)

### Add Database Connection
![Add Connection](screenshots/add_connection.png)

---

## Key Features

| Feature | Description |
|---|---|
| **Natural Language Queries** | Type plain English, get SQL + results instantly |
| **Auto Schema Detection** | Reads any PostgreSQL database structure automatically |
| **Self-Healing SQL Loop** | If SQL fails, error is fed back to AI for auto-correction |
| **Auto Charts** | Detects data type and renders bar, line, or pie charts |
| **Query History** | Every query saved with SQL, results, and timestamp |
| **Multi-DB Support** | Connect and switch between multiple databases |
| **JWT Authentication** | Secure register/login with bcrypt password hashing |
| **SQL Sanitization** | Only SELECT queries allowed — blocks DROP/DELETE/UPDATE |

---

## What Makes It Different from ChatGPT?

| ChatGPT | QueryMind |
|---|---|
| No DB connection — gives SQL text only | Connects to your real database |
| You must describe tables manually | Auto-reads schema via information_schema |
| Cannot execute queries | Executes SQL and returns actual data |
| No error recovery | Self-healing loop retries on failure |
| No memory between sessions | Query history saved to database |
| No visualization | Auto-generates charts from results |

---

## Tech Stack

**Backend**
- Python + FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Groq API (LLaMA 3.3 70b)
- JWT Authentication (python-jose + bcrypt)

**Frontend**
- React (Vite)
- Chart.js + react-chartjs-2
- React Router
- Axios

**Infrastructure**
- Render (backend + frontend deployment)
- Neon.tech (cloud PostgreSQL demo database)
- GitHub (version control)

---

## Architecture

```
User types question
        ↓
React Frontend (localhost:5173)
        ↓ HTTP POST /query/
FastAPI Backend (localhost:8000)
        ↓
┌───────────────────────────────────┐
│  schema_reader.py                 │
│  → reads DB structure via         │
│    information_schema             │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  llm_service.py                   │
│  → builds prompt (schema +        │
│    question) → calls Groq API     │
│  → returns SQL string             │
└───────────────┬───────────────────┘
                ↓
┌───────────────────────────────────┐
│  query_executor.py                │
│  → runs SQL against real DB       │
│  → if error → self-healing loop   │
│  → returns result rows            │
└───────────────┬───────────────────┘
                ↓
Result saved to query_history table
        ↓
JSON response → React renders
table + chart + SQL explanation
```

---

## Self-Healing SQL Loop

```python
for attempt in range(MAX_RETRIES + 1):
    try:
        result = execute_sql(sql)
        return result
    except SQLError as error:
        sql = llm.fix_sql(
            question=question,
            broken_sql=sql,
            error_message=error  # LLM sees the error and fixes it
        )
# Fixes ~90% of errors on first retry
```

---

## Database Schema

```
users
  id, email, password_hash, name, created_at

db_connections
  id, user_id → users.id,
  name, host, port, database, db_user, db_password

query_history
  id, user_id → users.id,
  connection_id → db_connections.id,
  question, sql_generated, result_rows,
  was_successful, error_message, executed_at
```

---

## Local Setup

### Prerequisites
- Python 3.11
- Node.js 20+
- PostgreSQL 14+

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/TanujaModugumudi/querymind.git
cd querymind

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your GROQ_API_KEY, DATABASE_URL, SECRET_KEY

# Run the server
python -m uvicorn main:app --reload
# Backend runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Environment Variables

```env
GROQ_API_KEY                = your_groq_api_key_from_console.groq.com
GROQ_MODEL                  = llama-3.3-70b-versatile
DATABASE_URL                = postgresql://user:password@localhost:5432/querymind_db
SECRET_KEY                  = your_secret_key
ALGORITHM                   = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 60
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login, returns JWT | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/connections/` | List DB connections | Yes |
| POST | `/connections/` | Add DB connection | Yes |
| DELETE | `/connections/{id}` | Delete connection | Yes |
| GET | `/connections/{id}/schema` | Get DB schema | Yes |
| POST | `/query/` | Run AI query | Yes |
| GET | `/history/` | Get query history | Yes |
| DELETE | `/history/{id}` | Delete history item | Yes |
| DELETE | `/history/` | Clear all history | Yes |

---

## Project Structure

```
querymind/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── database.py          # SQLAlchemy connection
│   ├── models.py            # DB table definitions
│   ├── schemas.py           # Pydantic validators
│   ├── auth.py              # JWT + bcrypt logic
│   ├── routers/
│   │   ├── auth_router.py   # Auth endpoints
│   │   ├── query.py         # Main query pipeline
│   │   ├── connections.py   # DB connection CRUD
│   │   └── history.py       # Query history
│   ├── services/
│   │   ├── schema_reader.py # DB schema introspection
│   │   ├── llm_service.py   # Groq API + prompt engineering
│   │   └── query_executor.py# SQL execution + self-healing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Routes + Auth wrapper
│   │   ├── api.js           # All API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── QueryInput.jsx
│   │       ├── SqlDisplay.jsx
│   │       ├── ResultTable.jsx
│   │       └── ChartView.jsx
│   └── package.json
└── README.md
```

---

## Testing

Tested at 4 levels:

1. **Golden Query Validation** — 20+ pre-known questions with verified answers
2. **Self-Healing Loop Testing** — deliberate bad queries to test error recovery
3. **Schema Portability** — tested with 3 different database schemas
4. **API Testing** — every endpoint tested in Swagger UI and Postman

---

## Deployment

- **Backend** — Render Web Service (Python, uvicorn)
- **Frontend** — Render Static Site (React/Vite build)
- **App Database** — Render managed PostgreSQL
- **Demo Database** — Neon.tech serverless PostgreSQL

---

## Built By

**Tanuja Modugumudi**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat&logo=github)](https://github.com/TanujaModugumudi)

---

## License

MIT License — feel free to use this project for learning and portfolio purposes.
