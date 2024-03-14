"""
    uvicorn app.app:app, port=8080
"""
import datetime
import logging
from typing import Optional, List

from pydantic import BaseConfig, BaseModel

BaseConfig.arbitrary_types_allowed = True


# Pydantic Model Definitions for all Tables


class SimpleLUTModel(BaseModel):
    id: int
    value: Optional[str]


class CategoryModel(SimpleLUTModel):
    notes: Optional[str]
    is_tax_deductible: Optional[bool] = False


class TagModel(SimpleLUTModel):
    notes: Optional[str]
    color: Optional[str]


class QualifierModel(SimpleLUTModel):
    institution_id: int


class InstitutionsModel(BaseModel):
    id: int
    key: str
    name: str
    class_name: Optional[str]
    notes: Optional[str]


class TemplateQualifierModel(BaseModel):
    template_id: int
    qualifier_id: int
    data_column: Optional[str]


class TemplateQualifierDetailModel(TemplateQualifierModel, QualifierModel):
    pass


class TemplateTagModel(BaseModel):
    template_id: int
    tag_id: int


class TransactionBatchModel(BaseModel):
    id: int
    run_date: datetime.datetime
    notes: Optional[str]


class ProcessedTransactionBatchModel(TransactionBatchModel):
    transaction_batch_id: int
    transaction_count: int


class TransactionNoteModel(BaseModel):
    id: int
    note: str
    transaction_id: int


class TransactionRecordModel(BaseModel):
    id: int
    batch_id: int
    institution: InstitutionsModel
    transaction_date: datetime.date
    transaction_data: List[str]
    tags: Optional[List[TagModel]]
    description: Optional[str]
    amount: Optional[float]
    notes: Optional[List[TransactionNoteModel]] = []
    category: Optional[CategoryModel]
    is_tax_deductible: Optional[bool] = False

    def update(self, transaction):
        logging.info(f"In update: {transaction}")
        if transaction.tags:
            for t in transaction.tags:
                if t not in self.tags:
                    self.tags.append(t)
        if transaction.notes:
            for n in transaction.notes:
                if n not in self.notes:
                    self.notes.append(n)


class ProcessedTransactionRecordModel(BaseModel):
    id: int
    processed_batch_id: int
    transaction: TransactionRecordModel
    template_id: Optional[int]
    institution_id: int

    def update(self, transaction: TransactionRecordModel):
        if transaction.transaction.tags:
            for t in transaction.transaction.tags:
                if t not in self.transaction.tags:
                    self.transaction.tags.append(t)
        if transaction.transaction.notes:
            for n in transaction.transaction.notes:
                if n not in self.transaction.notes:
                    self.transaction.notes.append(n)


class TransactionDescriptionModel(BaseModel):
    id: int
    institution_id: int
    column_number: int
    column_name: str
    column_type: str
    data_id: Optional[str]
    is_description: bool
    is_amount: bool
    is_transaction_date: bool


class SavedFilterModel(BaseModel):
    id: int
    name: str
    created: datetime.datetime

    institutions: Optional[List[InstitutionsModel]]
    categories: Optional[List[CategoryModel]]
    credit: Optional[bool]
    tags: Optional[List[TagModel]]
    match_all_tags: Optional[bool]
    start_date: Optional[datetime.datetime]
    end_date: Optional[datetime.datetime]
    search_string: Optional[str]


class BatchContentsModel(BaseModel):
    id: Optional[int]
    filename: Optional[str]
    institution_id: Optional[int]
    batch_id: Optional[int]
    added_date: Optional[datetime.datetime]
    file_date: Optional[datetime.datetime]
    transaction_count: Optional[int]
    notes: Optional[str]


class CreditCardModel(BaseModel):
    id: Optional[int]
    name: Optional[str]
    institution_id: Optional[int]
    interest_rate: Optional[float]
    interest_rate_cash: Optional[float]
    due_date: Optional[int]
    credit_limit: Optional[float]


class CreditCardDataModel(BaseModel):
    card_id: Optional[int]
    balance: Optional[float]
    balance_date: Optional[datetime.date]
    minimum_payment: Optional[float]
