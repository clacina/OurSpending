from rest_api.test.models import SavedFilters
from rest_api.test.factories.base import BaseFactory


"""
saved_filters
...
"""

class SavedFiltersFactory(BaseFactory):
    class Meta:
        abstract = False
        model = SavedFilters
