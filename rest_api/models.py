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


class ProcessedTransactionBatchModel(TransactionBatchModel):
    transaction_batch_id: int


class TransactionRecordModel(BaseModel):
    id: int
    batch_id: int
    institution_id: int
    transaction_date: datetime.date
    transaction_data: List[str]
    tags: Optional[List[str]] = []
    description: Optional[str]
    amount: Optional[float]
    notes: Optional[List[str]] = []


class ProcessedTransactionRecordModel(BaseModel):
    id: int
    processed_batch_id: int
    transaction_id: int
    template_id: Optional[int]
    institution_id: int


class TransactionDescriptionModel(BaseModel):
    id: int
    institution_id: int
    column_number: int
    column_name: str
    column_type: str
    is_description: bool
    is_amount: bool

#  ----------------------------------------------------------------------------------------------------


class TemplateInputModel(BaseModel):
    institution_id: int
    category: Optional[str]
    credit: bool
    tags: Optional[List[str]]
    qualifiers: Optional[List[str]]
    hint: str
    notes: Optional[str]


class TemplateReportModel(TemplateInputModel):
    id: int

    def update(self, rep):
        if rep.qualifiers:
            self.qualifiers += rep.qualifiers
        if rep.tags:
            self.tags += rep.tags


def parse_template_record(row):
    # if not row[7]:
    #     logging.info({"message": "Invalid payload passed to parse_template_row",
    #                   "row": row})
    #     return None, None
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
                institution_id=row[4],
                id=row[0],
                credit=row[2],
                tags=tags,
                hint=row[1],
                notes=row[3],
                qualifiers=qualifiers,
                category=row[12]
            )
            if not self.tr:
                self.tr = tr
            else:
                self.tr.update(tr)
        return self.tr


class TemplatesReportBuilder:
    """
    Returns a list of TemplateRemoteModel objects
                   0                     1               2                3                  4
    SELECT   templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id
                         5                 6
             , bank.name as bank_name, bank.key
                         7              8
             , t.id as tag_id, t.value as tag_value
                        9               10
             , tt.template_id, tt.tag_id
                        11                      12
             , c.id as category_id, c.value as category_value
                        13                      14
             , q.id AS qualifier_id, q.value as qualifier_value

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
                institution_id=row[4],
                id=row[0],
                credit=row[2],
                tags=tags,
                hint=row[1],
                notes=row[3],
                qualifiers=qualifiers,
                category=row[12],
            )
            if tr.id not in templates:
                templates[tr.id] = tr
            else:
                templates[tr.id].update(tr)

        template_list = list()
        for k, v in templates.items():
            template_list.append(v)
        return template_list


# New template reporting models

class TemplateDetailModel(BaseModel):
    id: int = None
    credit: bool = False
    hint: str = None
    notes: Optional[str]
    category: CategoryModel = None
    institution: InstitutionsModel = None

    tags: List[TagModel] = []
    qualifiers: List[QualifierModel] = []

    def update(self, data):
        self.id = data.id
        self.credit = data.credit
        self.hint = data.hint
        self.notes = data.notes
        self.category = data.category
        self.institution = data.institution

        for t in data.tags:
            if t not in self.tags:
                self.tags.append(t)

        for q in data.qualifiers:
            if q not in self.qualifiers:
                self.qualifiers.append(q)


class TemplateDetailReportBuilder:
    """
    Parse data and build a single template report object
    """

    def __init__(self, data):
        self.data = data
        self.tdm = TemplateDetailModel()

    def process(self):
        logging.info(f"query result: {self.data}")
        logging.info(f"Found {len(self.data)} records to parse")

        for row in self.data:
            if row[0] is None:
                # TODO: Should never happen, need to fix query
                break
            tdm = parse_template_detail_record(row)

            self.tdm.update(tdm)

        return self.tdm

"""
0    1     2        3         4             5        6    7          8          9              10
id, hint, credit, notes, institution_id, bank_name, key, tag_id, tag_value, category_id, category_value,
      11             12            13          14
 qualifier_id, qualifier_value, template_id, tag_id,
  
20,Loan Payment,false,,1,Wellsfargo Checking,WLS_CHK,4,Recurring,14,Loan,83,ONLINE TRANSFER REF ,20,4

"""


def parse_template_detail_record(row):
    category_id = row[9]
    category_value = row[10]
    qualifier_id = row[11]
    qualifier_value = row[12]

    institution_id = row[4]
    institution_name = row[5]
    institution_key = row[6]

    tag_id = row[7]
    tag_value = row[8]

    tr = TemplateDetailModel()
    tr.id = row[0]
    tr.hint = row[1]
    tr.credit = row[2]
    tr.notes = row[3]

    tr.institution = InstitutionsModel(id=institution_id, name=institution_name, key=institution_key)
    if category_id and category_value:
        tr.category = CategoryModel(id=category_id, value=category_value)

    if qualifier_id:
        qm = QualifierModel(id=qualifier_id, value=qualifier_value, institution_id=institution_id)
        tr.qualifiers.append(qm)

    if tag_id:
        tm = TagModel(id=tag_id, value=tag_value)
        tr.tags.append(tm)

    return tr
