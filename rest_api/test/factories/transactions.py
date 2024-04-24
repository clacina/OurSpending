from rest_api.test.models import TransactionBatch, TransactionBatchContents, TransactionColumnTypes, TransactionDataDescription, TransactionNotes, TransactionRecords
from rest_api.test.factories.base import BaseFactory


"""
transaction_batch
transaction_batch_components
transaction_column_types
transaction_data_description
transaction_notes
transaction_records
transaction_tags -- future
"""


class TransactionBatchFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TransactionBatch


class TransactionBatchContentsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TransactionBatchContents


class TransactionColumnTypesFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TransactionColumnTypes


class TransactionDataDescriptionFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TransactionDataDescription


class TransactionNotesFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TransactionNotes


class TransactionRecordsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = TransactionRecords


# class TransactionTagsFactory(BaseFactory):
#     class Meta:
#         abstract = False
#         model = TransactionTags
