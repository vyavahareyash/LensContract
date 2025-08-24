from datetime import timedelta
from typing import Dict, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.database import Database

from auth import (ACCESS_TOKEN_EXPIRE_MINUTES, Token, User, authenticate_user,
                    create_access_token, get_current_user, get_password_hash, UserInDB)
from services.mongo_client import get_db

from routers import contracts, tasks, tags


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

app.include_router(contracts.router)
app.include_router(tasks.router)
app.include_router(tags.router)


@app.post("/register", response_model=User)
async def register_user(user: UserInDB):
    hashed_password = get_password_hash(user.hashed_password) # user.hashed_password is actually the plain password here
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "disabled": user.disabled,
        "hashed_password": hashed_password,
    }
    return User(**users_db[user.username])


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
