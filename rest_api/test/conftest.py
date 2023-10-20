from starlette.config import environ
from starlette.testclient import TestClient
import pytest
from common.db_access import DBAccess
import logging

db_access = DBAccess()


@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    yield
    return
    """
    Create a clean test database every time the tests are run.
    """
    # url = str(settings.DATABASE_URL)
    # engine = create_engine(url)
    # assert not database_exists(url), 'Test database already exists. Aborting tests.'
    # create_database(url)             # Create the test database.
    # metadata.create_all(engine)      # Create the tables.
    # yield                            # Run the tests.
    # drop_database(url)               # Drop the test database.
    sql = 'CREATE DATABASE lacinaslair_test TEMPLATE lacinaslair'

    conn = db_access.connect_to_db()
    assert conn
    cur = conn.cursor()
    conn.autocommit = True
    print("Creating test db")
    try:
        cur.execute(sql)
        yield
    except Exception as e:
        logging.exception(f"Error creating test db: {str(e)}")
        raise e

    print("Delete database")
    sql = 'DROP DATABASE lacinaslair_test'
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        print(rows)
        yield
    except Exception as e:
        logging.exception(f"Error deleting test db: {str(e)}")
        raise e


# @pytest.fixture()
# def client():
#     # Our fixture is created within a context manager. This ensures that
#     # application lifespan runs for every test case.
#     with TestClient(app) as test_client:
#         yield test_client