"""
    uvicorn app.app:app --port=8080 --host=0.0.0.0
"""
import logging

from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseConfig

import user_model
from deps import get_current_user
from logger import setup_rich_logger

# import our router / routes
from routes import router, tags_metadata
from routers import templates, transactions, financial
from schemas import UserOut, UserAuth, TokenSchema, SystemUser
from utils import (
    create_access_token,
    create_refresh_token,
    verify_password,
)


# Allow pydantic models more freedom in validation
BaseConfig.arbitrary_types_allowed = True


def get_app() -> FastAPI:
    # Create our App
    app = FastAPI(
        title="Our Spending",
        description="Description",
        summary="Summary text",
        version="0.0.1",
        terms_of_service="Terms",
        contact={
            "name": "Chris Lacina",
            "url": "http://chrislacina.com",
            "email": "clacina@gmail.com"
        },
        license_info={
            "name": "Apache 2.0",
            "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
        },
        openapi_tags=tags_metadata
    )

    # Setup Logging
    setup_rich_logger()

    # Add routers
    app.include_router(router)
    app.include_router(templates.router)
    app.include_router(transactions.router)
    app.include_router(financial.router)

    return app


# Entrypoint
app = get_app()


@app.get("/ping", include_in_schema=False)
async def ping():
    return {"ping": "pong!"}


@app.get("/", response_class=RedirectResponse, include_in_schema=False)
async def docs():
    return RedirectResponse(url="/docs")


@app.post("/signup", summary="Create new user", response_model=UserOut)
async def create_user(data: UserAuth):
    return user_model.create_user(data.email, data.password)


@app.post(
    "/login",
    summary="Create access and refresh tokens for user",
    response_model=TokenSchema,
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = user_model.get_user(form_data.username)
    logging.info(f"Type: {type(user)}")
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    hashed_pass = user.password
    logging.info(
        f"Logging in: {form_data.username}, {form_data.password}, {hashed_pass}"
    )
    if not verify_password(form_data.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    return {
        "access_token": create_access_token(user.username),
        "refresh_token": create_refresh_token(user.username),
    }


@app.get(
    "/me", summary="Get details of currently logged in user", response_model=UserOut
)
async def get_me(user: SystemUser = Depends(get_current_user)):
    return user
