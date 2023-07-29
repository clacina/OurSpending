import logging
from datetime import datetime
from typing import Union, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError

from rest_api.schemas import TokenPayload, SystemUser
from common import db_access
from .utils import ALGORITHM, JWT_SECRET_KEY

reuseable_oauth = OAuth2PasswordBearer(tokenUrl="/login", scheme_name="JWT")


async def get_current_user(token: str = Depends(reuseable_oauth)) -> SystemUser:
    try:
        # token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODUzODIxNTAsInN1YiI6ImNsYWNpbmFAbWluZHNwcmluZy5jb20ifQ.lWWMZ_PGz2QAvu_goAe_clUAVhuF9QNAjH-WyRnanlA'
        logging.info(f"Token type: {type(token)}, len: {len(token)}")
        logging.info(f"Token to decode: [{token}], Key: {JWT_SECRET_KEY}, algorithm:{ALGORITHM}")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])

        logging.info("--Decode complete")
        token_data = TokenPayload(**payload)
        logging.info("--Payload Created")

        if datetime.fromtimestamp(token_data.exp) < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except (jwt.JWTError, ValidationError) as e:
        logging.error(f"Could not validate header: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user: Union[dict[str, Any], None] = db_access.get_user(token_data.sub)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not find user",
        )

    return SystemUser(**user)
