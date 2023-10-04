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
    value: str


class CategoryModel(SimpleLUTModel):
    notes: Optional[str]


class TagModel(SimpleLUTModel):
    notes: Optional[str]
    color: str


class QualifierModel(SimpleLUTModel):
    institution_id: int


class InstitutionsModel(BaseModel):
    id: int
    key: str
    name: str
    notes: Optional[str]


class TemplateQualifierModel(BaseModel):
    template_id: int
    qualifier_id: int


class TemplateTagModel(BaseModel):
    template_id: int
    tag_id: int


class TransactionBatchModel(BaseModel):
    id: int
    run_date: datetime.datetime
    notes: str


class ProcessedTransactionBatchModel(TransactionBatchModel):
    transaction_batch_id: int


class TransactionRecordModel(BaseModel):
    id: int
    batch_id: int
    institution: InstitutionsModel
    transaction_date: datetime.date
    transaction_data: List[str]
    tags: Optional[List[TagModel]]
    description: Optional[str]
    amount: Optional[float]
    notes: Optional[List[str]] = []
    category: Optional[CategoryModel]


class ProcessedTransactionRecordModel(BaseModel):
    id: int
    processed_batch_id: int
    transaction: TransactionRecordModel
    template_id: Optional[int]
    institution_id: int


class TransactionDescriptionModel(BaseModel):
    id: int
    institution_id: int
    column_number: int
    column_name: str
    column_type: str
    data_id: Optional[str]
    is_description: bool
    is_amount: bool
