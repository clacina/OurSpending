from rest_api.test.models import Tags
from rest_api.test.factories.base import BaseFactory


"""
tags
"""

class TagsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Tags
