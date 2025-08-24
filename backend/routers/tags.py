from typing import List

from fastapi import APIRouter, Depends
from pymongo.database import Database

from auth import User, get_current_user
from services.mongo_client import get_db

router = APIRouter()


@router.get("/tags", response_model=List[str])
def get_tags(db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    tags = db.tags.find()
    return [tag["name"] for tag in tags]
