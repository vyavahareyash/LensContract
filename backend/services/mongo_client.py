import os
from pymongo import MongoClient

client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client[os.getenv("MONGO_DB_NAME", "lens_contract")]


def get_db():
    return db
