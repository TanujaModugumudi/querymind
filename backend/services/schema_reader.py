from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError


def build_connection_url(host: str, port: int, database: str,
                         db_user: str, db_password: str) -> str:
    return f"postgresql://{db_user}:{db_password}@{host}:{port}/{database}"


def test_connection(host: str, port: int, database: str,
                    db_user: str, db_password: str) -> dict:
    try:
        url = build_connection_url(host, port, database, db_user, db_password)
        engine = create_engine(url, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"success": True, "message": "Connection successful"}
    except OperationalError as e:
        return {"success": False, "message": str(e)}


def get_schema(host: str, port: int, database: str,
               db_user: str, db_password: str) -> str:
    url = build_connection_url(host, port, database, db_user, db_password)
    engine = create_engine(url)

    query = text("""
        SELECT
            c.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            CASE
                WHEN kcu.column_name IS NOT NULL THEN 'PRIMARY KEY'
                ELSE ''
            END AS key_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.table_constraints tc
            ON  tc.table_name   = c.table_name
            AND tc.table_schema = c.table_schema
            AND tc.constraint_type = 'PRIMARY KEY'
        LEFT JOIN information_schema.key_column_usage kcu
            ON  kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema    = tc.table_schema
            AND kcu.column_name     = c.column_name
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position
    """)

    with engine.connect() as conn:
        rows = conn.execute(query).fetchall()

    if not rows:
        return "No tables found in this database."

    schema_text = _format_schema(rows)
    return schema_text


def _format_schema(rows) -> str:
    tables = {}

    for row in rows:
        table_name  = row[0]
        column_name = row[1]
        data_type   = row[2]
        is_nullable = row[3]
        key_type    = row[4]

        if table_name not in tables:
            tables[table_name] = []

        column_info = f"  - {column_name} ({data_type})"

        if key_type == "PRIMARY KEY":
            column_info += " [PK]"
        if is_nullable == "NO":
            column_info += " NOT NULL"

        tables[table_name].append(column_info)

    result = []
    for table_name, columns in tables.items():
        result.append(f"Table: {table_name}")
        result.extend(columns)
        result.append("")

    return "\n".join(result)


def get_foreign_keys(host: str, port: int, database: str,
                     db_user: str, db_password: str) -> str:
    url = build_connection_url(host, port, database, db_user, db_password)
    engine = create_engine(url)

    query = text("""
        SELECT
            kcu.table_name        AS from_table,
            kcu.column_name       AS from_column,
            ccu.table_name        AS to_table,
            ccu.column_name       AS to_column
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema   = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema   = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND   tc.table_schema    = 'public'
    """)

    with engine.connect() as conn:
        rows = conn.execute(query).fetchall()

    if not rows:
        return ""

    fk_lines = ["Relationships (Foreign Keys):"]
    for row in rows:
        fk_lines.append(
            f"  - {row[0]}.{row[1]} → {row[2]}.{row[3]}"
        )

    return "\n".join(fk_lines)


def get_full_context(host: str, port: int, database: str,
                     db_user: str, db_password: str) -> str:
    schema = get_schema(host, port, database, db_user, db_password)
    foreign_keys = get_foreign_keys(host, port, database, db_user, db_password)

    if foreign_keys:
        return schema + "\n" + foreign_keys
    return schema