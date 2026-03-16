from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from services.schema_reader import test_connection, get_full_context

router = APIRouter(prefix="/connections", tags=["DB Connections"])


@router.post("/", response_model=schemas.DBConnectionOut)
def add_connection(
    data: schemas.DBConnectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    test = test_connection(
        host=data.host,
        port=data.port,
        database=data.database,
        db_user=data.db_user,
        db_password=data.db_password
    )

    if not test["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not connect to database: {test['message']}"
        )

    new_conn = models.DBConnection(
        user_id=current_user.id,
        name=data.name,
        host=data.host,
        port=data.port,
        database=data.database,
        db_user=data.db_user,
        db_password=data.db_password
    )

    db.add(new_conn)
    db.commit()
    db.refresh(new_conn)

    return new_conn


@router.get("/", response_model=list[schemas.DBConnectionOut])
def get_connections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    connections = db.query(models.DBConnection).filter(
        models.DBConnection.user_id == current_user.id
    ).all()
    return connections


@router.get("/{connection_id}/schema")
def get_schema(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conn = db.query(models.DBConnection).filter(
        models.DBConnection.id == connection_id,
        models.DBConnection.user_id == current_user.id
    ).first()

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    schema = get_full_context(
        host=conn.host,
        port=conn.port,
        database=conn.database,
        db_user=conn.db_user,
        db_password=conn.db_password
    )

    return {"connection_id": connection_id, "schema": schema}


@router.delete("/{connection_id}")
def delete_connection(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conn = db.query(models.DBConnection).filter(
        models.DBConnection.id == connection_id,
        models.DBConnection.user_id == current_user.id
    ).first()

    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    db.delete(conn)
    db.commit()

    return {"message": "Connection deleted successfully"}