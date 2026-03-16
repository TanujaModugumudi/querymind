from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name          = Column(String(100))
    created_at    = Column(DateTime, default=datetime.utcnow)

    connections   = relationship("DBConnection", back_populates="owner")
    queries       = relationship("QueryHistory", back_populates="user")


class DBConnection(Base):
    __tablename__ = "db_connections"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    name        = Column(String(100), nullable=False)
    host        = Column(String(255), nullable=False)
    port        = Column(Integer, default=5432)
    database    = Column(String(100), nullable=False)
    db_user     = Column(String(100), nullable=False)
    db_password = Column(String(255), nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    owner       = relationship("User", back_populates="connections")
    queries     = relationship("QueryHistory", back_populates="connection")


class QueryHistory(Base):
    __tablename__ = "query_history"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    connection_id  = Column(Integer, ForeignKey("db_connections.id"), nullable=False)
    question       = Column(Text, nullable=False)
    sql_generated  = Column(Text)
    result_rows    = Column(Integer)
    was_successful = Column(Boolean, default=True)
    error_message  = Column(Text)
    executed_at    = Column(DateTime, default=datetime.utcnow)

    user           = relationship("User", back_populates="queries")
    connection     = relationship("DBConnection", back_populates="queries")