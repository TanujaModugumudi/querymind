from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from services.llm_service import fix_sql, detect_chart_type
import re

MAX_RETRIES = 2


def run_query(
    question: str,
    sql: str,
    schema: str,
    host: str,
    port: int,
    database: str,
    db_user: str,
    db_password: str
) -> dict:

    url = f"postgresql://{db_user}:{db_password}@{host}:{port}/{database}"
    engine = create_engine(url)

    last_error = None

    for attempt in range(MAX_RETRIES + 1):
        try:
            safe_sql = _sanitize(sql)

            with engine.connect() as conn:
                result = conn.execute(text(safe_sql))
                rows = result.fetchall()
                columns = list(result.keys())

            data = [dict(zip(columns, row)) for row in rows]

            chart_type = detect_chart_type(question, columns)

            return {
                "success": True,
                "data": data,
                "columns": columns,
                "row_count": len(data),
                "chart_type": chart_type,
                "sql_used": safe_sql,
                "attempts": attempt + 1
            }

        except SQLAlchemyError as e:
            last_error = str(e)

            if attempt < MAX_RETRIES:
                sql = fix_sql(
                    question=question,
                    schema=schema,
                    broken_sql=sql,
                    error_message=last_error
                )
            else:
                return {
                    "success": False,
                    "error": last_error,
                    "sql_used": sql,
                    "attempts": attempt + 1
                }


def _sanitize(sql: str) -> str:
    sql = sql.strip()

    dangerous = [
        "drop ", "delete ", "truncate ",
        "insert ", "update ", "alter ",
        "create ", "grant ", "revoke "
    ]

    sql_lower = sql.lower()
    for word in dangerous:
        if sql_lower.startswith(word):
            raise ValueError(
                f"Query type '{word.strip()}' is not allowed. "
                f"Only SELECT queries are permitted."
            )

    if not sql_lower.startswith("select"):
        raise ValueError("Only SELECT queries are allowed.")

    return sql