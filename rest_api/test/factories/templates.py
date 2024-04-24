from rest_api.test.models import Templates, TemplateTags, TemplateQualifiers
from rest_api.test.factories.base import BaseFactory

"""
templates
template_tags
template_qualifiers
"""


class TemplatesFactory(BaseFactory):
    class Meta:
        abstract = False
        model = Templates


class TemplateTagsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TemplateTags


class TemplateQualifiersFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TemplateQualifiers
