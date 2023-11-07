"""
    uvicorn app.app:app, port=8080
"""

import logging
from typing import Optional, List
from rest_api.models import CategoryModel, InstitutionsModel, TagModel, QualifierModel
from pydantic import BaseConfig, BaseModel

BaseConfig.arbitrary_types_allowed = True


# ---------------------------------- TEMPLATE MODELS --------------------------
class TemplateInputModel(BaseModel):
    institution_id: Optional[int]
    category: Optional[CategoryModel] = None
    credit: Optional[bool]
    tags: Optional[List[TagModel]]
    qualifiers: Optional[List[QualifierModel]]
    hint: Optional[str]
    notes: Optional[str]


class TemplateReportModel(TemplateInputModel):
    id: Optional[int]

    def update(self, data):
        self.id = data.id
        self.credit = data.credit
        self.hint = data.hint
        self.notes = data.notes
        self.category = data.category
        self.institution_id = data.institution.id

        for t in data.tags:
            if t not in self.tags:

                self.tags.append(t)

        for q in data.qualifiers:
            if q not in self.qualifiers:
                self.qualifiers.append(q)


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


# -------------------- REPORT BUILDERS -------------------------

class SingleTemplateReportBuilder:  # NOTE: Only used in template update route
    """
    Parse data and build a single template report object
    """

    def __init__(self, data):
        self.data = data
        self.tr = None

    def process(self):
        # logging.info(f"query result: {self.data}")
        # logging.info(f"Found {len(self.data)} records to parse")
        #      0              1               2              3        4        5            6                     7
        # templates.id, templates.hint, templates.credit, t.value, c.value, q.value, templates.notes, templates.institution_id FROM templates
        """                  0              1                 2                 3                       4
        SELECT   templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
                               5               6
                 , bank.name as bank_name, bank.key
                          7                 8
                 , t.id as tag_id, t.value as tag_value
                          9           10
                 , tt.template_id, tt.tag_id
                            11                     12
                 , c.id as category_id, c.value as category_value
                            13                     14
                 , q.id AS qualifier_id, q.value as qualifier_value
        """
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
                category=CategoryModel(
                    value=row[12],
                    id=1,
                    notes='')
            )
            if not self.tr:
                self.tr = tr
            else:
                self.tr.update(tr)
        return self.tr


class TemplatesReportBuilder:  # NOT USED
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
        # logging.info(f"query result: {self.data}")
        # logging.info(f"Found {len(self.data)} records to parse")

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


class TemplateDetailReportBuilder:  # called by single template and by template list
    """
    Parse data and build a single template report object
    """
    def __init__(self, data):
        self.data = data
        self.tdm = TemplateDetailModel()

    def process(self):
        for rec in self.data:
            tdm = parse_template_detail_record(rec)
            self.tdm.update(tdm)
        return self.tdm


class TemplatesDetailReportBuilder:
    def __init__(self, data):
        self.data = data

    def process(self):
        usage = {}
        templates = []
        for row in self.data:
            if row[0] is None:
                # TODO: Should never happen, need to fix query
                # raise
                break
            # tdrb = TemplateDetailReportBuilder([row]).process()
            tdrb = parse_template_detail_record(row)
            if tdrb.id not in usage:
                usage[tdrb.id] = {}
            usage[tdrb.id].update(tdrb)
        for k, v in usage.items():
            templates.append(v)
        return templates


# ------------------------ QUERY PARSE ROUTINES --------------------------

"""                  0              1                 2                 3                       4
SELECT   templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
                       5               6
         , bank.name as bank_name, bank.key
                  7                 8
         , t.id as tag_id, t.value as tag_value
                  9           10 
         , tt.template_id, tt.tag_id
                    11                     12
         , c.id as category_id, c.value as category_value
                    13                     14
         , q.id AS qualifier_id, q.value as qualifier_value 
"""


def parse_template_record(row):
    return row[10], row[13]


def parse_template_detail_record(row):
    """
           0                   1                 2                 3                 4
    templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
                          5               6
             , bank.name as bank_name, bank.key
                      7                 8
             , t.id as tag_id, t.value as tag_value
                      9            10
             , tt.template_id, tt.tag_id
                      11                        12
             , c.id as category_id, c.value as category_value
                      13                        14
             , q.id AS qualifier_id, q.value as qualifier_value
    """
    tr = TemplateDetailModel()
    tr.id = row[0]
    tr.hint = row[1]
    tr.credit = row[2]
    tr.notes = row[3]

    category_id = row[11]
    category_value = row[12]

    qualifier_id = row[13]
    qualifier_value = row[14]

    institution_id = row[4]
    institution_name = row[5]
    institution_key = row[6]

    tag_id = row[7]
    tag_value = row[8]

    tr.institution = InstitutionsModel(id=institution_id, name=institution_name, key=institution_key)
    if category_id and category_value:
        tr.category = CategoryModel(id=category_id, value=category_value)

    if qualifier_id:
        qm = QualifierModel(id=qualifier_id, value=qualifier_value, institution_id=institution_id)
        tr.qualifiers.append(qm)

    if tag_id:
        tm = TagModel(id=tag_id, value=tag_value, color='black')
        tr.tags.append(tm)

    return tr


class TemplateQualifier:
    def __init__(self):
        self.template_id = None
        self.qualifier_id = None

    def parse(self, data: tuple):
        self.template_id = data[0]
        self.qualifier_id = data[1]

    def __repr__(self):
        return f"{self.template_id} - {self.qualifier_id}"


class TemplateTag:
    def __init__(self):
        self.template_id = None
        self.tag_id= None

    def parse(self, data: tuple):
        self.template_id = data[0]
        self.tag_id = data[1]

    def __repr__(self):
        return f"{self.template_id}: {self.tag_id}"


class BankingTemplate:
    def __init__(self, inst_id=None):
        self.id = None
        self.institution_id = inst_id
        self.qualifiers = list()
        self.category_id = None
        self.credit = None
        self.tags = list()
        self.hint = None
        self.notes = None

    def parse(self, data):
        assert len(data) == 6, f"Wrong data type: {data}"
        # Parsed from db
        self.id = data[0]
        self.institution_id = data[1]
        self.category_id = data[2]
        self.credit = data[3]
        self.hint = data[4]
        self.notes = data[5]

    def __repr__(self):
        return f"{self.hint} - {self.institution_id} {self.credit} {self.category_id} {self.notes}"
