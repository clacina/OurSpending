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

def parse_template_record(row):
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
        tm = TagModel(id=tag_id, value=tag_value)
        tr.tags.append(tm)

    return tr
