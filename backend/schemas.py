from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── User schemas ────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── DB Connection schemas ────────────────────────────────────────

class DBConnectionCreate(BaseModel):
    name: str
    host: str
    port: int = 5432
    database: str
    db_user: str
    db_password: str

class DBConnectionOut(BaseModel):
    id: int
    name: str
    host: str
    port: int
    database: str
    db_user: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Query schemas ────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str
    connection_id: int

class QueryResponse(BaseModel):
    question: str
    sql_generated: str
    result: list
    chart_type: str
    explanation: str
    row_count: int


# ─── History schemas ──────────────────────────────────────────────

class HistoryOut(BaseModel):
    id: int
    question: str
    sql_generated: Optional[str]
    result_rows: Optional[int]
    was_successful: bool
    error_message: Optional[str]
    executed_at: datetime

    class Config:
        from_attributes = True


# ─── Token schemas (for JWT auth) ────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None