from services.llm_service import generate_sql, explain_sql

schema = """
Table: customers
  - id (integer) [PK] NOT NULL
  - name (character varying) NOT NULL
  - email (character varying)
  - city (character varying)

Table: orders
  - id (integer) [PK] NOT NULL
  - customer_id (integer) NOT NULL
  - total_amount (numeric)
  - order_date (timestamp)

Relationships (Foreign Keys):
  - orders.customer_id → customers.id
"""

question = "Show me the top 3 customers by total orders"

sql = generate_sql(question, schema)
print("Generated SQL:")
print(sql)
print()

explanation = explain_sql(sql, question)
print("Explanation:")
print(explanation)