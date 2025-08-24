from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["lens_contract"]


def get_db():
    return db
