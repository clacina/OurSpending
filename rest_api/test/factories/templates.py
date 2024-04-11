from rest_api.test.models import Templates
from rest_api.test.factories.base import BaseFactory


class TemplatesFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Templates
