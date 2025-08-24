from typing import List

from fastapi import APIRouter, Depends
from pymongo.database import Database

from auth import User, get_current_user
from services.mongo_client import get_db

router = APIRouter()


@router.get("/tasks", response_model=List[str])
def get_tasks(db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.tasks.find()
    return [task["name"] for task in tasks]
