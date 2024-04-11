from rest_api.test.models import Categories
from rest_api.test.factories.base import BaseFactory


class CategoryFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Categories
