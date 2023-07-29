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
    pass


class TagModel(SimpleLUTModel):
    pass


class QualifierModel(SimpleLUTModel):
    institution_id: int


class InstitutionsModel(BaseModel):
    id: int
    key: str
    name: str


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


class TransactionRecordModel(BaseModel):
    id: int
    batch_id: int
    institution_id: int
    transaction_date: datetime.date
    transaction_data: List[str]
    notes: Optional[str]
    tags: Optional[List[str]]


#  ----------------------------------------------------------------------------------------------------


class TemplateInputModel(BaseModel):
    institution_id: int
    category: str
    credit: bool
    tags: Optional[List[str]]
    qualifiers: Optional[List[str]]
    hint: str
    notes: Optional[str]


class TemplateReportModel(TemplateInputModel):
    template_id: int

    def update(self, rep):
        if rep.qualifiers:
            self.qualifiers += rep.qualifiers
        if rep.tags:
            self.tags += rep.tags


def parse_template_record(row):
    if not row[7]:
        return

    if isinstance(row[3], List):
        tags = row[3]
    elif isinstance(row[3], str):
        tags = [row[3]]
    else:
        tags = []

    if isinstance(row[5], List):
        qualifiers = row[5]
    elif isinstance(row[5], str):
        qualifiers = [row[5]]
    else:
        qualifiers = []

    return tags, qualifiers


class SingleTemplateReportBuilder:
    """
    Parse data and build a single template report object
    """

    def __init__(self, data):
        self.data = data
        self.tr = None

    def process(self):
        logging.info(f"query result: {self.data}")
        logging.info(f"Found {len(self.data)} records to parse")
        #      0              1               2              3        4        5            6                     7
        # templates.id, templates.hint, templates.credit, t.value, c.value, q.value, templates.notes, templates.institution_id FROM templates
        for row in self.data:
            if row[0] is None:
                # TODO: Should never happen, need to fix query
                break
            tags, qualifiers = parse_template_record(row)

            tr = TemplateReportModel(
                institution_id=row[7],
                template_id=row[0],
                credit=row[2],
                tags=tags,
                hint=row[1],
                notes=row[6],
                qualifiers=qualifiers,
                category=row[4],
            )
            if not self.tr:
                self.tr = tr
            else:
                self.tr.update(tr)
        return self.tr


class TemplatesReportBuilder:
    """
    Returns a list of TemplateRemoteModel objects
    """

    def __init__(self, data):
        self.data = data

    def process(self):
        logging.info(f"query result: {self.data}")
        logging.info(f"Found {len(self.data)} records to parse")

        templates = {}
        for row in self.data:
            if row[0] is None:
                # TODO: Should never happen, need to fix query
                break
            tags, qualifiers = parse_template_record(row)

            tr = TemplateReportModel(
                institution_id=row[7],
                template_id=row[0],
                credit=row[2],
                tags=tags,
                hint=row[1],
                notes=row[6],
                qualifiers=qualifiers,
                category=row[4],
            )
            if tr.template_id not in templates:
                templates[tr.template_id] = tr
            else:
                templates[tr.template_id].update(tr)

        template_list = list()
        for k, v in templates.items():
            template_list.append(v)
        return template_list
