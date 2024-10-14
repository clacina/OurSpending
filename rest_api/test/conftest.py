import pytest
from sqlalchemy import create_engine, event
from common.db_access import DBAccess
from .models import Base
from .db import Session
import sys

db_access = DBAccess()

TEST_DB_NAME = "lacinaslair_test"
MAIN_DB_NAME = "lacinaslair"
DB_SERVER = "postgresql://lacinaslair:gr8ful@10.0.0.100:5432"

"""
test_models.py::TestCategoryFactory::test_1
  /home/clacina/projects/OurSpending/rest_api/test/conftest.py:74: RemovedIn20Warning: Deprecated API features 
  detected! These feature(s) are not compatible with SQLAlchemy 2.0. To prevent incompatible upgrades prior to 
  updating applications, ensure requirements files are pinned to "sqlalchemy<2.0". Set environment variable 
  SQLALCHEMY_WARN_20=1 to show all deprecation warnings.  Set environment variable SQLALCHEMY_SILENCE_UBER_WARNING=1 
  to silence this message. (Background on SQLAlchemy 2.0 at: https://sqlalche.me/e/b8d9)
"""


@pytest.fixture(scope="session")
def connection(request):
    print("In Connection")

    engine = create_engine(f"{DB_SERVER}")
    conn = engine.connect()
    conn.execution_options(isolation_level="AUTOCOMMIT")

    try:
        conn.execute(f"""CREATE DATABASE {TEST_DB_NAME} ENCODING 'UTF8' """)
    except Exception as e:
        print(f"Create Exception: {str(e)}")

    # Create a new engine/connection that will actually connect
    # to the test database we just created. This will be the
    # connection used by the test suite run.
    test_engine = create_engine(
        f"{DB_SERVER}/{TEST_DB_NAME}"
    )
    test_connection = test_engine.connect()
    Base.metadata.create_all(test_engine)

    def teardown():
        print("In Connection Teardown")
        try:
            conn.execute(f"DROP DATABASE {TEST_DB_NAME} WITH (FORCE)")
        except Exception as e:
            print(f"Teardown exception: {str(e)}")

        test_connection.close()
        conn.close()
        print("ctd done")

    request.addfinalizer(teardown)
    return test_connection


@pytest.fixture(autouse=True)
def session(connection, request):
    print("In Session")
    transaction = connection.begin()
    session = Session(bind=connection)
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(db_session, transaction):
        if transaction.nested and not transaction._parent.nested:
            session.expire_all()
            session.begin_nested()

    def teardown():
        print("Session Teardown")
        Session.remove()
        print("st2")
        transaction.rollback()
        print("st3")

    request.addfinalizer(teardown)
    return session
