from rest_api.test.models import ProcessedTransactionBatch, ProcessedTransactionRecords
from rest_api.test.factories.base import BaseFactory


"""
processed_transaction_batch
processed_transaction_records

"""


class ProcessedTransactionBatchFactory(BaseFactory):
    class Meta:
        abstract = False
        model = ProcessedTransactionBatch


class ProcessedTransactionRecordsFactory(BaseFactory):
    class Meta:
        abstract = False
        model = ProcessedTransactionRecords
