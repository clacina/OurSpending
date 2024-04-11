from rest_api.test.models import Categories, Templates
from rest_api.test.factories.categories import CategoryFactory
from rest_api.test.factories.templates import TemplatesFactory


class TestCategoryFactory:

    def test_1(self, session, caplog):

        CategoryFactory(value="Test Value")
        assert session.query(Categories).count() == 1
        assert session.query(Categories).all()[0].value == "Test Value"

    def test_2(self, session):
        TemplatesFactory(institution_id=1, hint="Testing Template")
        assert session.query(Templates).count() == 1
        assert session.query(Templates).all()[0].hint == "Testing Template"
