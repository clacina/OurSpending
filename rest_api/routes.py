"""
    uvicorn app.app:app, port=8080
"""
import decimal
import json
import logging
from datetime import datetime
from typing import Optional, List

from pydantic import BaseConfig, BaseModel

from fastapi import APIRouter, Query, HTTPException, status, Body, Request

import rest_api.models as models
from common import db_access
from rest_api.template_models import (
    TemplateDetailModel,
    TemplatesDetailReportBuilder,
    TemplateReportModel,
    TemplateDetailReportBuilder,
    TemplateInputModel,
    SingleTemplateReportBuilder,
)


router = APIRouter()


""" ---------- Templates -------------------------------------------------------------------------"""


@router.get(
    "/templates",
    summary="Get list of available templates. May restrict the search by Institution",
    response_model=List[TemplateDetailModel],
)
async def query_templates(institution_id: Optional[int] = Query(-1)):
    """
    :param institution_id: Institution id.
    """
    query_result = db_access.query_templates_by_institution(institution_id)
    if query_result:
        return TemplatesDetailReportBuilder(query_result).process()
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unable to find templates for institution: {institution_id}",
        )


@router.post(
    "/templates",
    status_code=status.HTTP_201_CREATED,
    response_model=TemplateReportModel,
)
def add_template(template: TemplateInputModel = Body(...)):
    db_access.create_template(
        institution_id=template.institution_id,
        category=template.category,
        is_credit=template.credit,
        hint=template.hint,
        notes=template.notes,
        qualifiers=template.qualifiers,
        tags=template.tags,
    )


@router.get(
    "/template/{template_id}",
    summary="Get list of available templates. May restrict the search by Institution",
    response_model=TemplateDetailModel,
)
async def get_template(template_id: int):
    query_result = db_access.query_templates_by_id(template_id)
    if query_result:
        return TemplateDetailReportBuilder(query_result).process()
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Unable to find template with id: {template_id}",
    )


@router.put(
    "/template/{template_id}",
    summary="Update a specific template",
    response_model=TemplateReportModel,
)
def update_template(template_id: int, template: TemplateReportModel = Body(...)):
    query_result = db_access.query_templates_by_id(template_id)
    if not query_result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    existing_template = SingleTemplateReportBuilder(query_result).process()
    update_data = template.dict(exclude_unset=True)
    new_template = existing_template.copy(update=update_data)

    # Store updated template in database
    # TODO: Store changed template in DB

    return new_template


""" ---------- Batches ---------------------------------------------------------------------------"""


@router.get(
    "/batches",
    summary="List all batches in the system.",
    response_model=List[models.TransactionBatchModel],
)
async def get_batches():
    query_result = db_access.list_batches()
    response = []
    for row in query_result:
        entry = models.TransactionBatchModel(
            id=row[0],
            run_date=row[1],
            notes=row[2],
        )
        response.append(entry)
    return response


@router.get(
    "/batch/{batch_id}",
    summary="Get details for a specific batch of transactions",
    response_model=models.TransactionBatchModel,
)
async def get_batch(batch_id: int):
    query_result = db_access.fetch_batch(batch_id)
    if query_result:
        response = models.TransactionBatchModel(
            id=query_result[0],
            run_date=query_result[1],
            notes=query_result[2],
        )
        return response
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found."
    )


""" ---------- Categories ------------------------------------------------------------------------"""


@router.get(
    "/categories",
    summary="Get list of available templates. May restrict the search by Institution",
    response_model=List[models.CategoryModel],
)
async def get_categories():
    query_result = db_access.load_categories()
    response = []
    for q in query_result:
        cat = models.CategoryModel(
            id=q[0],
            value=q[1],
        )
        response.append(cat)

    return response


@router.get(
    "/category/{category_id}",
    summary="Query a single category",
    response_model=models.CategoryModel,
)
async def get_category(category_id: int):
    query_result = db_access.get_category(category_id)
    if not query_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found."
        )
    return models.CategoryModel(id=query_result[0], value=query_result[1])


@router.post(
    "/categories",
    summary="Add a new Category",
    response_model=models.CategoryModel,
    status_code=status.HTTP_201_CREATED,
)
async def add_category(
    value: str = Body(...),
):
    logging.info(f"Create Category: {value}")
    query_result = db_access.create_category(value=value)
    if not query_result:  # category exists
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Category already exists.",
        )
    return models.CategoryModel(id=query_result[0], value=query_result[1])


@router.put(
    "/category/{category_id}",
    summary="Update the value for a single category",
    response_model=models.CategoryModel,
)
async def update_category(
    category_id: int,
    value: str = Body(...),
):
    logging.info(f"Updating Category: {category_id} to {value}")
    try:
        db_access.update_category(category_id=category_id, value=value)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Category already exists.",
        )
    return models.CategoryModel(id=category_id, value=value)


""" ---------- Institutions ----------------------------------------------------------------------"""


@router.get(
    "/institutions",
    summary="Get a list of institutions",
    response_model=List[models.InstitutionsModel],
)
async def get_institutions():
    query_result = db_access.load_institutions()
    response = []
    for q in query_result:
        inst = models.InstitutionsModel(id=q[0], key=q[1], name=q[2])
        response.append(inst)

    return response


@router.post(
    "/institutions",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Institution record for processing",
    response_model=models.InstitutionsModel,
)
async def create_institution(info: Request = None):
    data = await info.json()
    logging.info(f"Create Institution: {data}")

    new_id = db_access.create_institution(data["key"], data["name"])
    inst = models.InstitutionsModel(id=new_id, key=data["key"], name=data["name"])
    return inst


@router.get(
    "/institution/{institution_id}",
    summary="Get details for a specific institution",
    response_model=models.InstitutionsModel,
)
async def get_institution(institution_id: int):
    query_result = db_access.fetch_institution(institution_id)
    response = models.InstitutionsModel(
        id=query_result[0], key=query_result[1], name=query_result[2]
    )
    return response


""" ---------- Qualifiers  ------------------------------------------------------------------------"""


@router.get(
    "/qualifiers", summary="List qualifiers", response_model=List[models.QualifierModel]
)
async def get_qualifiers():
    query_result = db_access.load_qualifiers()
    response = []
    for q in query_result:
        cat = models.QualifierModel(id=q[0], value=q[1], institution_id=q[2])
        response.append(cat)

    return response


@router.get(
    "/qualifier/{qualifier_id}",
    summary="Get details for a specific qualifier",
    response_model=models.QualifierModel,
)
async def get_qualifier(qualifier_id: int):
    q = db_access.fetch_qualifier(qualifier_id)
    cat = models.QualifierModel(id=q[0], value=q[1], institution_id=q[2])

    return cat


@router.post(
    "/qualifiers",
    summary="Create a new qualifier keyphrase.",
    response_model=models.QualifierModel,
    status_code=status.HTTP_201_CREATED,
)
async def add_qualifier(
    value: str = Body(...),
    institution_id: str = Body(...),
):
    logging.info(f"Create Qualifier: {value}")
    query_result = db_access.create_qualifer(value=value, institution_id=institution_id)
    if not query_result:  # qualifier exists
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Qualifier already exists.",
        )
    return models.QualifierModel(id=query_result[0], value=query_result[1])


""" ---------- Tags ------------------------------------------------------------------------------"""


@router.get("/tags", summary="List existing tags", response_model=List[models.TagModel])
async def get_tags():
    query_result = db_access.load_tags()
    response = []
    for q in query_result:
        cat = models.TagModel(
            id=q[0],
            value=q[1],
        )
        response.append(cat)

    return response


@router.get(
    "/tag/{tag_id}",
    summary="Get details for a specific tag record",
    response_model=models.TagModel,
)
async def get_tag(tag_id: int):
    q = db_access.fetch_tag(tag_id)
    cat = models.TagModel(id=q[0], value=q[1])

    return cat


@router.post(
    "/tags",
    summary="Create a new tag keyphrase.",
    response_model=models.TagModel,
    status_code=status.HTTP_201_CREATED,
)
async def add_tag(
    value: str = Body(...),
):
    logging.info(f"Create Tag: {value}")
    query_result = db_access.create_tag(value=value)
    if not query_result:  # tag exists
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Tag already exists.",
        )
    return models.TagModel(id=query_result[0], value=query_result[1])


""" ---------- Transactions ----------------------------------------------------------------------"""


@router.get("/transactions", response_model=List[models.TransactionRecordModel])
async def get_transactions(batch_id: int, limit: int = 100, offset: int = 0):
    transactions = db_access.query_transactions_from_batch(
        batch_id=batch_id, offset=offset, limit=limit
    )

    transaction_list = []
    for tr in transactions:
        try:
            model = parse_transaction_record(tr)
            transaction_list.append(model)
        except Exception as e:
            logging.info(f"Got exception: {str(e)}")

    return transaction_list


def parse_transaction_record(row):
    """
0         transaction_records.id AS TID, 
1         transaction_records.batch_id AS BID, 
2         transaction_records.transaction_date, 
3         transaction_records.institution_id as BANK_ID,
4         transaction_records.transaction_data,
5         transaction_records.description,
6         transaction_records.amount
7,8      , bank.name as bank_name, bank.key
9, 10    , t.id as tag_id, t.value as tag_value 
11, 12   , tt.transaction_id, tt.tag_id
13, 14   , c.id as category_id, c.value as category_value 
15       , tn.note
    
    
    0    (85, 
    1     1, 
    2     datetime.date(2023, 2, 26), 
    3     6,
    4     ['02/26/2023', '02:08:21', 'PST', 'ALIPAY US, INC.', 'Express Checkout Payment', 'Completed',
              '1', '', '-19.28', '12990501203230226593801919513', '', 'Debit'], 
    5     'ALIPAY US, INC.',
    6     Decimal('-19.2800'), 
    7     'PayPal', 
    8     'PP', 
    9     None, 
    10     None, 
    11     None, 
    12    None, 
    13     None, 
    14     None)
    """
    txn_category = None
    txn_tags = []
    if row[13] is not None:
        txn_category = models.CategoryModel(
            id=row[13],
            value=row[14]
        )
    if row[9] is not None:
        txn_tags.append(models.TagModel(
            id=row[9],
            value=row[10]
        ))

    logging.info(f"Row: {row}")
    """
    (92, 
    1, 
    datetime.date(2023, 3, 6), 
    6, 
    ['03/06/2023', '12:34:44', 'PST', 'Udemy', 'Express    routes.py:423
             Checkout Payment', 'Completed', 'USD', '-14.33', '0.00', '-14.33', 'clacina@mindspring.com',
             'payments@udemy.com', '6AT54470H5253413J', 'course:3656160', '', '1.34', '', '', '', '', '', '',
             '292343312', '1', '', '-14.33', 'Basic Home Electrical Wiring by Example and On the Job', '',
             'Debit'], 
    'Udemy', 
    Decimal('-14.3300'), 
    'PayPal', 
    'PP', 
    None, None, None, None, None, None, None)
    """
    try:
        tr = models.TransactionRecordModel(
            id=row[0],
            batch_id=row[1],
            institution=models.InstitutionsModel(
                id=row[3],
                key=row[7],
                name=row[8]
            ),
            transaction_date=row[2],
            transaction_data=row[4],
            tags=txn_tags,
            description=row[5],
            amount=row[6],
            notes=row[15],
            category=txn_category
        )
        logging.info(f"TR complete: {tr}")
    except Exception as e:
        logging.exception(f"Can't create model {str(e)}")
    return tr


@router.get(
    "/transaction/{transaction_id}",
    summary="Get details for a specific transaction",
    response_model=models.TransactionRecordModel,
)
async def get_transaction(transaction_id: int):
    # id, batch_id, institution_id, transaction_date, transaction_data, description, amount
    row = db_access.fetch_transaction(transaction_id=transaction_id)
    tags = db_access.query_tags_for_transaction(transaction_id=transaction_id)
    notes = db_access.query_notes_for_transaction(transaction_id=transaction_id)

    tr = models.TransactionRecordModel(
        id=row[0],
        batch_id=row[1],
        institution_id=row[2],
        transaction_date=row[3],
        transaction_data=row[4],
        description=row[5],
        amount=row[6],
        tags=tags,
        notes=notes,
    )
    return tr


@router.get(
    "/transaction/{transaction_id}/tags",
    summary="Get tags for a specific transaction",
    response_model=List[models.TagModel],
)
async def get_transaction_tags(transaction_id: int):
    # id, batch_id, institution_id, transaction_date, transaction_data, description, amount
    row = db_access.fetch_transaction(transaction_id=transaction_id)
    tags = db_access.query_tags_for_transaction(transaction_id=transaction_id)

    tag_list = []
    for t in tags:
        tt = models.TagModel(id=t[0], value=t[1])
        tag_list.append(tt)
    return tag_list


@router.put(
    "/transaction/{transaction_id}/tags",
    summary="Get details for a specific transaction",
    response_model=models.TransactionRecordModel,
)
async def add_tag_to_transaction(
    transaction_id: int,
    value: str = Body(...),
):
    logging.info(f"Adding tag to transaction: {transaction_id} - {value}")

    existing_tag = db_access.fetch_tag_by_value(value)
    if not existing_tag:
        query_result = db_access.create_tag(value=value)
        tag_id = query_result[0]
    else:
        tag_id = existing_tag[0]

    db_access.add_tag_to_transaction(transaction_id, tag_id)

    return get_transaction(transaction_id)


@router.get(
    "/transactions_descriptions",
    response_model=List[models.TransactionDescriptionModel],
)
async def get_transaction_descriptions():
    # SELECT id, institution_id, transaction_date, transaction_data, description, amount
    transaction_data = db_access.load_transaction_data_descriptions()

    transaction_list = []
    for row in transaction_data:
        tr = models.TransactionDescriptionModel(
            id=row[0],
            institution_id=row[1],
            column_number=row[2],
            column_name=row[3],
            column_type=row[4],
            is_description=row[5],
            is_amount=row[6],
            data_id=row[7],
        )
        transaction_list.append(tr)
    return transaction_list


""" ---------- Processed Batches ------------------------------------------------------------------"""


@router.get(
    "/processed_batches",
    summary="List all processed batches in the system.",
    response_model=List[models.ProcessedTransactionBatchModel],
)
async def get_processed_batches():
    query_result = db_access.list_processed_batches()
    response = []
    for row in query_result:
        entry = models.ProcessedTransactionBatchModel(
            id=row[0],
            run_date=row[1],
            notes=row[2],
            transaction_batch_id=row[3],
        )
        response.append(entry)
    return response


@router.get(
    "/processed_batch/{batch_id}",
    summary="Get details for a specific processed batch of transactions",
    response_model=models.ProcessedTransactionBatchModel,
)
async def get_batch(batch_id: int):
    query_result = db_access.fetch_processed_batch(batch_id)
    if query_result:
        response = models.ProcessedTransactionBatchModel(
            id=query_result[0],
            run_date=query_result[1],
            notes=query_result[2],
            transaction_batch_id=query_result[3],
        )
        return response
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found."
    )


""" ---------- Processed Transactions ----------------------------------------------------------------------"""


@router.get(
    "/processed_transactions",
    response_model=List[models.ProcessedTransactionRecordModel],
)
async def get_processed_transactions(batch_id: int, limit: int = 100, offset: int = 0):
    transactions = db_access.get_processed_transaction_records(
        batch_id=batch_id, offset=offset, limit=limit
    )

    """
     (142, 1, 1,
         44, 142, 142, 1, datetime.date(2023, 4, 26), 1, ['04/26/2023', '-20.17', '*', '', 'PURCHASE
         AUTHORIZED ON 04/26 ARCO#07027ARCO LAKEWOOD WA P000000272952645 CARD 0094'], 'PURCHASE AUTHORIZED
         ON 04/26 ARCO#07027ARCO LAKEWOOD WA P000000272952645 CARD 0094', Decimal('-20.1700'), 'Wellsfargo
         Checking', 'WLS_CHK', None, None, None, None, None, None, None)
    
SELECT   processed_transaction_records.id as PID,
         processed_transaction_records.processed_batch_id as BID, 
         processed_transaction_records.institution_id,
         processed_transaction_records.template_id, processed_transaction_records.transaction_id,
    """
    transaction_list = []
    if transactions:
        for row in transactions:
            tr = models.ProcessedTransactionRecordModel(
                id=row[0],
                processed_batch_id=batch_id,
                transaction_id=row[4],
                template_id=row[3],
                institution_id=row[2],
                transaction=parse_transaction_record(row[5:])
            )
            transaction_list.append(tr)
    else:
        logging.info(
            {"message": f"No transactions found for processed batch {batch_id}"}
        )

    return transaction_list


@router.get(
    "/processed_transaction/{transaction_id}",
    summary="Get details for a specific transaction",
    response_model=models.ProcessedTransactionRecordModel,
)
async def get_processed_transaction(transaction_id: int):
    # id, batch_id, institution_id, transaction_date, transaction_data, description, amount
    row = db_access.fetch_transaction(transaction_id=transaction_id)
    tags = db_access.query_tags_for_transaction(transaction_id=transaction_id)
    notes = db_access.query_notes_for_transaction(transaction_id=transaction_id)

    tr = models.ProcessedTransactionRecordModel(
        id=row[0],
        batch_id=row[1],
        institution_id=row[2],
        transaction_date=row[3],
        transaction_data=row[4],
        description=row[5],
        amount=row[6],
        tags=tags,
        notes=notes,
    )
    return tr


""" Aggregate Results """


# class TransactionModel(BaseModel):
#     transaction_id: int
#     transaction_date: datetime
#     amount: decimal
#     description: str
#
#
# class TemplateMatchModel(BaseModel):
#     template_id: int
#     category_id: int
#     description: str
#     transactions: List[TransactionModel]
#
#
# class ProcessorModel(BaseModel):
#     processor_id: int
#     templates: List[TemplateMatchModel]


# @router.get("/processed/templates", summary="Template Matching Data")
# async def query_processed_templates(
#     processed_batch_id: int,
#     institution_id: Optional[int] = None,
#     include_spending: Optional[bool] = True,
#     include_missing: Optional[bool] = False,
# ):
#     """
#     Builds a json model list transaction to template matches and omissions.
#     Grouped by institution
#     :param processed_batch_id:
#     :param institution_id:
#     :param include_spending:
#     :param include_missing:
#     :return:
#     """
#     logging.info("Template data requested")
#
#     report_data = reports.ReportData()
#     report_data.categories = db_utils.db_access.load_categories()
#     report_data.tags = db_utils.db_access.load_tags()
#     report_data.institutions = db_utils.db_access.load_institutions()
#     all_processors = settings.create_configs()
#
#     for bank in all_processors:
#         if not institution_id or bank.config.institution_id == institution_id:
#             bank.analyze_data(processed_batch_id=processed_batch_id)
#             # print(json.dumps(bank.spending, indent=4))
#             # print(bank.__dict__)
#             bank_json = {
#                 "name": bank["name"],
#                 "datafile": bank["datafile"],
#                 "transactions": bank["transactions"],
#                 "config": bank["config"],
#                 "unrecognized_transactions": bank["unrecognized_transactions"],
#                 "spending": bank["spending"],
#                 "category_breakdown": bank["category_breakdown"],
#             }
#
#             for tx in ["transactions"]:
#                 print(tx.__dict__)
#
#     # {
#     #     'name': 'Care Credit',
#     #     'datafile': None,
#     #     'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x0000020845E51F90 > , < processing.transaction_models.CareCreditTransaction object at 0x00000208457E0550 > , < processing.transaction_models.CareCreditTransaction object at 0x0000020845E52590 > , < processing.transaction_models.CareCreditTransaction object at 0x0000020845789690 > ],
#     #     'config': < processing.settings.ConfigurationData object at 0x0000020845EF00D0 > ,
#     #     'unrecognized_transactions': [],
#     #     'spending': {
#     #         1: {
#     #             'banking_entity': Vet - 11 False 27 None,
#     #             'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x0000020845E51F90 > ]
#     #         },
#     #         2: {
#     #             'banking_entity': Interest - 11 False 13 None,
#     #             'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x00000208457E0550 > , < processing.transaction_models.CareCreditTransaction object at 0x0000020845789690 > ]
#     #         },
#     #         3: {
#     #             'banking_entity': Payment - 11 False 16 None,
#     #             'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x0000020845E52590 > ]
#     #         }
#     #     },
#     #     'category_breakdown': {}
#     # }
#
#     # tm = TemplateMatch(
#     #     template_id=
#     # )
#     # proc = ProcessorModel(
#     #     processor_id=bank.config.institution_id,
#     #     templates=templates
#     # )
#
#     def _draw_spending_table(
#         self, processor, outfile, total_spending_count, verbose=False
#     ):
#         outfile.write(
#             "<thead><tr><th>Template ID</th><th># Transactions</th><th>Total</th><th>Category</th><th>Description</th"
#             "></tr></thead>\n"
#         )
#         for k, v in processor.spending.items():
#             desc = " | ".join(v["banking_entity"].qualifiers)
#             amount = 0.0
#             category = self.report_data.get_category(v["banking_entity"].category_id)
#             for item in v["transactions"]:
#                 amount += item.amount
#
#             outfile.write("<tr>")
#             outfile.write(
#                 f'<td  class="right">{k}</td><td  class="right">{len(v["transactions"])}</td><td class="right">${amount}</td><td>{category}</td><td bgcolor="blue" style="color: white;">{desc}</td>'
#             )
#             outfile.write("</tr>\n")
#             if verbose:  # list all transactions below
#                 outfile.write(
#                     '<tr><td colspan=5 bgcolor="MediumSeaGreen"><table class="sub_section_div" '
#                     "width=90%><thead><tr><th>Transaction "
#                     "Id</th><th>Date</th><th>Amount</th><th>Description</th></tr></thead>\n"
#                 )
#
#                 for t in v["transactions"]:
#                     outfile.write(
#                         f'<tr><td  class="right">{t.transaction_id}</td><td class="right">{t.date}</td><td class="right">{t.amount}</td><td>{t.description}</td></tr>\n'
#                     )
#                 outfile.write("</table>\n")
#
#         outfile.write("</table>\n")
#
#     def _draw_extras_table(self, processor, outfile):
#         outfile.write(
#             f"<h3>Unrecognized Transactions</h3><p>{len(processor.unrecognized_transactions)} Transactions</p>\n"
#         )
#
#         outfile.write(
#             '<table class="first_table cell-border"><thead><tr><th>Id</th><th>Date</th><th>Amount</th><th>Description</th></tr></thead>\n'
#         )
#         for e in processor.unrecognized_transactions:
#             outfile.write(
#                 f'<tr><td class="right">{e.transaction_id}</td><td class="right">{e.date}</td><td class="right">${e.amount}</td><td>{e.description}</td></tr>\n'
#             )
#
#         outfile.write("</table>\n")
#
#     def _line_item_report(
#         self, processor, outfile, include_spending=True, include_extras=True
#     ):
#         # Validate that entry counts match
#         total_spending_count = processor.calc_spending_item_count()
#
#         outfile.write(
#             f"<h2>{processor.name}</h2> <p>{len(processor.transactions)} Transactions</p>\n"
#         )
#
#         if include_spending:
#             self._draw_spending_table(
#                 processor, outfile, total_spending_count, verbose=True
#             )
#
#         if include_extras and len(processor.unrecognized_transactions):
#             self._draw_extras_table(processor, outfile)
