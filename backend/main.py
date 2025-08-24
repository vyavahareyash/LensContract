from datetime import timedelta
from typing import List, Dict, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from pymongo.database import Database

from auth import (ACCESS_TOKEN_EXPIRE_MINUTES, Token, User, authenticate_user,
                    create_access_token, get_current_user, get_password_hash)
from schemas.contract import Contract
from services.mongo_client import get_db


# Dummy user database (replace with a real database in production)
users_db = {
    "testuser": {
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "disabled": False,
        "hashed_password": get_password_hash("testpassword"),
    }
}

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/db")
def test_db(db: Database = Depends(get_db)):
    try:
        db.command("ping")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/contracts")
def create_contract(contract: Contract, db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Save the contract
    contract_dict = contract.model_dump()
    contract_dict["total_amount"] = contract.total_amount
    result = db.contracts.insert_one(contract_dict)

    # Save unique tasks
    for task in contract.tasks:
        db.tasks.update_one(
            {"name": task.name}, {"$setOnInsert": {"name": task.name}}, upsert=True
        )

    # Save unique tags
    for tag in contract.tags:
        db.tags.update_one({"name": tag}, {"$setOnInsert": {"name": tag}}, upsert=True)

    return {"inserted_id": str(result.inserted_id)}


@app.get("/tasks", response_model=List[str])
def get_tasks(db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.tasks.find()
    return [task["name"] for task in tasks]


@app.get("/tags", response_model=List[str])
def get_tags(db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    tags = db.tags.find()
    return [tag["name"] for tag in tags]


@app.get("/contracts")
def get_contracts(
    db: Database = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    tags: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = {}
    if tags:
        query["tags"] = {"$in": tags.split(",")}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    total_count = db.contracts.count_documents(query)
    contracts = []
    for contract in db.contracts.find(query).skip(skip).limit(limit):
        contract["id"] = str(contract["_id"])
        del contract["_id"]
        contracts.append(contract)
    return {"total_count": total_count, "contracts": contracts}


@app.get("/contracts/{contract_id}")
def get_contract(contract_id: str, db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    contract = db.contracts.find_one({"_id": ObjectId(contract_id)})
    if contract:
        contract["id"] = str(contract["_id"])
        del contract["_id"]
        return contract
    raise HTTPException(status_code=404, detail="Contract not found")


@app.put("/contracts/{contract_id}")
def update_contract(
    contract_id: str, contract: Contract, db: Database = Depends(get_db), current_user: User = Depends(get_current_user)
):
    contract_dict = contract.model_dump()
    contract_dict["total_amount"] = contract.total_amount
    result = db.contracts.update_one(
        {"_id": ObjectId(contract_id)}, {"$set": contract_dict}
    )
    if result.modified_count == 1:
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Contract not found")


@app.delete("/contracts/{contract_id}")
def delete_contract(contract_id: str, db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = db.contracts.delete_one({"_id": ObjectId(contract_id)})
    if result.deleted_count == 1:
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Contract not found")


@app.get("/summary")
def get_summary(db: Database = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_contracts = db.contracts.count_documents({})
    total_amount_pipeline = [
        {"$group": {"_id": None, "total_amount": {"$sum": "$total_amount"}}}
    ]
    total_amount_result = list(db.contracts.aggregate(total_amount_pipeline))
    total_amount = total_amount_result[0]["total_amount"] if total_amount_result else 0

    contracts_by_tags_pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
    ]
    contracts_by_tags_result = list(db.contracts.aggregate(contracts_by_tags_pipeline))
    contracts_by_tags = {
        item["_id"]: item["count"] for item in contracts_by_tags_result
    }

    contracts_by_tasks_pipeline = [
        {"$unwind": "$tasks"},
        {"$group": {"_id": "$tasks.name", "count": {"$sum": 1}}},
    ]
    contracts_by_tasks_result = list(
        db.contracts.aggregate(contracts_by_tasks_pipeline)
    )
    contracts_by_tasks = {
        item["_id"]: item["count"] for item in contracts_by_tasks_result
    }

    return {
        "total_contracts": total_contracts,
        "total_amount": total_amount,
        "contracts_by_tags": contracts_by_tags,
        "contracts_by_tasks": contracts_by_tasks,
    }
