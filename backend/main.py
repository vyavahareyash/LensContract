from fastapi import FastAPI, Depends, Body, HTTPException
from backend.services.mongo_client import get_db
from pymongo.database import Database
from backend.schemas.contract import Contract
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

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

@app.get("/contracts")
def get_contracts(db: Database = Depends(get_db), skip: int = 0, limit: int = 10):
    total_count = db.contracts.count_documents({})
    contracts = []
    for contract in db.contracts.find().skip(skip).limit(limit):
        contract["id"] = str(contract["_id"])
        del contract["_id"]
        contracts.append(contract)
    return {"total_count": total_count, "contracts": contracts}

@app.get("/contracts/{contract_id}")
def get_contract(contract_id: str, db: Database = Depends(get_db)):
    contract = db.contracts.find_one({"_id": ObjectId(contract_id)})
    if contract:
        contract["id"] = str(contract["_id"])
        del contract["_id"]
        return contract
    raise HTTPException(status_code=404, detail="Contract not found")

@app.put("/contracts/{contract_id}")
def update_contract(contract_id: str, contract: Contract, db: Database = Depends(get_db)):
    contract_dict = contract.model_dump()
    contract_dict["total_amount"] = contract.total_amount
    result = db.contracts.update_one({"_id": ObjectId(contract_id)}, {"$set": contract_dict})
    if result.modified_count == 1:
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Contract not found")

@app.delete("/contracts/{contract_id}")
def delete_contract(contract_id: str, db: Database = Depends(get_db)):
    result = db.contracts.delete_one({"_id": ObjectId(contract_id)})
    if result.deleted_count == 1:
        return {"status": "ok"}
    raise HTTPException(status_code=404, detail="Contract not found")
