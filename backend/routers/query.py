from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from services.schema_reader import get_full_context
from services.llm_service import generate_sql, explain_sql
from services.query_executor import run_query

router = APIRouter(prefix="/query", tags=["Query"])


@router.post("/", response_model=schemas.QueryResponse)
def execute_query(
    request: schemas.QueryRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conn = db.query(models.DBConnection).filter(
        models.DBConnection.id == request.connection_id,
        models.DBConnection.user_id == current_user.id
    ).first()

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database connection not found"
        )

    schema = get_full_context(
        host=conn.host,
        port=conn.port,
        database=conn.database,
        db_user=conn.db_user,
        db_password=conn.db_password
    )

    sql = generate_sql(
        question=request.question,
        schema=schema
    )

    result = run_query(
        question=request.question,
        sql=sql,
        schema=schema,
        host=conn.host,
        port=conn.port,
        database=conn.database,
        db_user=conn.db_user,
        db_password=conn.db_password
    )

    history_entry = models.QueryHistory(
        user_id=current_user.id,
        connection_id=conn.id,
        question=request.question,
        sql_generated=result.get("sql_used"),
        result_rows=result.get("row_count"),
        was_successful=result.get("success"),
        error_message=result.get("error")
    )
    db.add(history_entry)
    db.commit()

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not execute query: {result['error']}"
        )

    explanation = explain_sql(
        sql=result["sql_used"],
        question=request.question
    )

    return schemas.QueryResponse(
        question=request.question,
        sql_generated=result["sql_used"],
        result=result["data"],
        chart_type=result["chart_type"],
        explanation=explanation,
        row_count=result["row_count"]
    )