from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Session, select
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gesundwerk.db")
engine = create_engine(DATABASE_URL, echo=False)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    is_verified: bool = Field(default=False)
    verification_code: Optional[str] = Field(default=None, index=True)

class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    key: str
    title: str
    unit: str
    daily_target: int
    reminder_minutes: int

class Journal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    date: str
    text: str

class UserState(SQLModel, table=True):
    user_id: int = Field(primary_key=True)
    data: str  # JSON string


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    return Session(engine)
