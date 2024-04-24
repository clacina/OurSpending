import factory

# Same session factory used by the previous fixture
from rest_api.test.db import Session


class BaseFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        sqlalchemy_session = Session
        sqlalchemy_session_persistence = "commit"