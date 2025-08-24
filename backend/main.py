from fastapi import FastAPI, Depends, Body
from backend.services.mongo_client import get_db
from pymongo.database import Database
from backend.schemas.contract import Contract
from typing import List

app = FastAPI()


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
def create_contract(contract: Contract, db: Database = Depends(get_db)):
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
def get_tasks(db: Database = Depends(get_db)):
    tasks = db.tasks.find()
    return [task["name"] for task in tasks]


@app.get("/tags", response_model=List[str])
def get_tags(db: Database = Depends(get_db)):
    tags = db.tags.find()
    return [tag["name"] for tag in tags]
