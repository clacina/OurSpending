from fastapi import status, HTTPException

import rest_api.utils
from common.db_access import DBAccess
db_access = DBAccess()

"""  Server actions """


class User:
    def __init__(self):
        self.username = None
        self.password = None


def get_user(username: str):
    sql = """
        SELECT 
            password
        FROM
            users
        WHERE
            username=%(username)s
    """
    query_params = {
        "username": username,
    }

    conn = db_access.connect_to_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchone()
        if result:
            user = User()
            user.username = username
            user.password = result[0]
            return user
    except Exception as e:
        print(f"Error retrieving user: {str(e)}")
        raise e
    return None


def create_user(username: str, password: str):
    if get_user(username) is not None:
        raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exist",
            )

    sql = """
        INSERT INTO
            users (username, password)
        VALUES (
            %(username)s, %(password)s
        )
    """
    query_params = {
        "username": username,
        "password": app.utils.get_hashed_password(password)
    }

    conn = db_access.connect_to_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error retrieving user: {str(e)}")
        raise e
