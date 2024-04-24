from rest_api.test.models import YourModel
from rest_api.test.factories.base import BaseFactory


class YourModelFactory(BaseFactory):
    class Meta:
        abstract = False
        model = YourModel
