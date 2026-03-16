from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/", response_model=list[schemas.HistoryOut])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    history = db.query(models.QueryHistory).filter(
        models.QueryHistory.user_id == current_user.id
    ).order_by(
        models.QueryHistory.executed_at.desc()
    ).limit(50).all()

    return history


@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.QueryHistory).filter(
        models.QueryHistory.id == history_id,
        models.QueryHistory.user_id == current_user.id
    ).first()

    if not item:
        return {"message": "Not found"}

    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}


@router.delete("/")
def clear_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.QueryHistory).filter(
        models.QueryHistory.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "History cleared"}