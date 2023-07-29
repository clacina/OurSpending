import logging
from datetime import datetime, timedelta
from typing import Union, Any

from jose import jwt
from passlib.context import CryptContext

ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ALGORITHM = "HS256"
JWT_SECRET_KEY = (
    "Jerry Garcia"  # os.environ['JWT_SECRET_KEY']     # should be kept secret
)
JWT_REFRESH_SECRET_KEY = (
    "Robert Hunter"  # os.environ['JWT_REFRESH_SECRET_KEY']      # should be kept secret
)

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expires_delta = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    # payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    logging.info(f"encode: {to_encode}: {JWT_SECRET_KEY}, {ALGORITHM}")
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)
    logging.info(f"New token: [{encoded_jwt}]")

    payload = jwt.decode(encoded_jwt, JWT_SECRET_KEY, ALGORITHM)
    logging.info(f"encoded type: {type(encoded_jwt)}: [{payload}]\n, Len:{len(encoded_jwt)}")
    assert payload == to_encode

    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expires_delta = datetime.utcnow() + timedelta(
            minutes=REFRESH_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt
