from groq import Groq
from dotenv import load_dotenv
import os
import re

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# ─── Main function ────────────────────────────────────────────────

def generate_sql(question: str, schema: str) -> str:
    prompt = _build_prompt(question, schema)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert PostgreSQL query writer. "
                    "You only return valid SQL queries — nothing else. "
                    "No explanations, no markdown, no code blocks. "
                    "Just the raw SQL query ending with a semicolon."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=500,
    )

    raw_output = response.choices[0].message.content.strip()
    sql = _clean_sql(raw_output)
    return sql


# ─── Retry with error feedback (self-healing loop) ────────────────

def fix_sql(question: str, schema: str,
            broken_sql: str, error_message: str) -> str:
    prompt = f"""
The following SQL query was generated for this question: "{question}"

Database schema:
{schema}

Generated SQL (which has an error):
{broken_sql}

Error received when executing:
{error_message}

Please fix the SQL query. Return ONLY the corrected SQL query.
No explanations, no markdown, no code blocks. Just raw SQL.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert PostgreSQL query writer. "
                    "You fix broken SQL queries. "
                    "Return only the corrected raw SQL query."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=500,
    )

    raw_output = response.choices[0].message.content.strip()
    return _clean_sql(raw_output)


# ─── Generate plain English explanation ──────────────────────────

def explain_sql(sql: str, question: str) -> str:
    prompt = f"""
The user asked: "{question}"
This SQL query was generated: {sql}

In 1-2 simple sentences, explain what this query does in plain English.
No technical jargon. Write as if explaining to a non-technical business user.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You explain SQL queries in simple plain English."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=150,
    )

    return response.choices[0].message.content.strip()


# ─── Detect best chart type for results ──────────────────────────

def detect_chart_type(question: str, columns: list) -> str:
    question_lower = question.lower()

    # Time-based → line chart
    if any(word in question_lower for word in
           ["trend", "over time", "monthly", "daily", "yearly",
            "by month", "by year", "by date", "timeline"]):
        return "line"

    # Distribution → pie chart
    if any(word in question_lower for word in
           ["distribution", "breakdown", "percentage",
            "share", "proportion"]):
        return "pie"

    # If result has exactly 2 columns and second looks numeric → bar
    if len(columns) == 2:
        return "bar"

    # If result has a numeric-sounding second column → bar
    numeric_hints = ["count", "total", "sum", "amount",
                     "revenue", "sales", "orders", "quantity",
                     "spending", "price", "avg", "average"]
    if len(columns) >= 2:
        second_col = columns[1].lower()
        if any(hint in second_col for hint in numeric_hints):
            return "bar"

    return "table"


# ─── Helper: build the main prompt ───────────────────────────────

def _build_prompt(question: str, schema: str) -> str:
    return f"""
You are given the following PostgreSQL database schema:

{schema}

Write a PostgreSQL SQL query to answer this question:
"{question}"

Rules:
- Use only tables and columns that exist in the schema above
- Always use proper JOINs when data from multiple tables is needed
- Use table aliases for clarity
- Add LIMIT 100 if the query could return many rows
- Return ONLY the raw SQL query, nothing else
- NEVER select password, password_hash, secret, token or any credential columns
- If selecting from users table, only select: id, email, name, created_at
"""

# ─── Helper: clean LLM output ────────────────────────────────────

def _clean_sql(raw: str) -> str:
    # Remove markdown code blocks if LLM added them
    raw = re.sub(r"```sql", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"```", "", raw)

    # Remove any lines that are not SQL
    lines = raw.strip().split("\n")
    sql_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("--"):
            sql_lines.append(stripped)

    sql = " ".join(sql_lines).strip()

    # Ensure it ends with semicolon
    if sql and not sql.endswith(";"):
        sql += ";"

    return sql