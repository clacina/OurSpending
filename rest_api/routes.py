"""
    uvicorn app.app:app, port=8080
"""
from __future__ import annotations

import logging
from typing import Annotated
from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException, status, Body, Request
from fastapi import Path
from pydantic import BaseModel

import models as models
from common.db_access import DBAccess
from models import TagModel
from reports import report_processor
from reports import reports
from routers.transactions import parse_transaction_record

router = APIRouter()
db_access = DBAccess()


""" ---------- Endpoint Tags --------------------------------------------------------------------"""
tags_metadata = [
    {"name": "Batches"},
    {"name": "Batch Details"},
    {"name": "Categories"},
    {"name": "Institutions"},
    {"name": "Processed Batches"},
    {"name": "Processed Transactions"},
    {"name": "Qualifiers"},
    {"name": "Saved Filters"},
    {"name": "Tags"},
    {"name": "Templates"},
    {"name": "Transactions"},
    {"name": "Actions"},
]



""" ---------- Batches ---------------------------------------------------------------------------"""


@router.get(
    "/batches",
    summary="List all transaction batches in the system.",
    response_model=List[models.TransactionBatchModel],
    tags=["Batches"]
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


class ErrorItem(BaseModel):
    value: str


@router.get(
    "/batch/{batch_id}",
    summary="Get details for a specific batch of transactions",
    tags=["Batches"],
    responses={
        '404': {"model": ErrorItem, "description": "The specified batch was not found."},
        '200': {"model": models.TransactionBatchModel}
    }
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
        status_code=status.HTTP_404_NOT_FOUND, detail="Exception batch was not found."
    )


""" ---------- Categories ------------------------------------------------------------------------"""


@router.get(
    "/categories",
    summary="Get list of available categories.",
    response_model=List[models.CategoryModel],
    tags=["Categories"]
)
async def get_categories():
    query_result = db_access.load_categories()
    response = []
    for q in query_result:
        cat = models.CategoryModel(
            id=q[0],
            value=q[1],
            is_tax_deductible=q[2],
            notes=q[3]
        )
        response.append(cat)

    return response


@router.get(
    "/category/{category_id}",
    summary="Query a single category",
    response_model=models.CategoryModel,
    tags=["Categories"]
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
    tags=["Categories"]
)
async def add_category(info: Request):
    json_data = await info.json()
    query_result = db_access.create_category(value=json_data['value'], notes=json_data.get('notes'))
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
    tags=["Categories"]
)
async def update_category(
        category_id: int,
        value: str = Body(...),
        notes: str = Body(...),
        is_tax_deductible: bool = Body(...),
):
    try:
        db_access.update_category(category_id=category_id, value=value,
                                  is_tax_deductible=is_tax_deductible, notes=notes)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Category already exists.",
        )
    return models.CategoryModel(id=category_id, value=value, notes=notes)



""" ---------- Qualifiers  ------------------------------------------------------------------------"""


@router.get(
    "/qualifiers", summary="List qualifiers",
    response_model=List[models.QualifierModel],
    tags=["Qualifiers"]
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
    tags=["Qualifiers"]
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
    tags=["Qualifiers"]
)
async def add_qualifier(
        value: str = Body(...),
        institution_id: int = Body(...),
):
    query_result = db_access.create_qualifier(value=value, institution_id=institution_id)
    if not query_result:  # qualifier exists
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Qualifier already exists.",
        )
    logging.info(f"New id of {query_result[0]}")
    return models.QualifierModel(id=query_result[0], value=value, institution_id=institution_id)


""" ---------- Tags ------------------------------------------------------------------------------"""


@router.get("/tags",
            summary="List existing tags",
            response_model=List[models.TagModel],
            tags=["Tags"]
            )
async def get_tags():
    query_result = db_access.load_tags()
    response = []
    for q in query_result:
        cat = models.TagModel(
            id=q[0],
            value=q[1],
            notes=q[2],
            color=q[3]
        )
        response.append(cat)

    return response


@router.get(
    "/tag/{tag_id}",
    summary="Get details for a specific tag record",
    response_model=models.TagModel,
    tags=["Tags"]
)
async def get_tag(tag_id: int):
    q = db_access.fetch_tag(tag_id)
    cat = models.TagModel(id=q[0], value=q[1], notes=q[2], color=q[3])

    return cat


@router.post(
    "/tags",
    summary="Create a new tag keyphrase.",
    response_model=models.TagModel,
    status_code=status.HTTP_201_CREATED,
    tags=["Tags"]
)
async def add_tag(
        value: str = Body(...),
        notes: str = Body(...),
        color: str = Body(...),
):
    query_result = db_access.create_tag(value=value, notes=notes, color=color)
    if not query_result:  # tag exists
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Tag already exists.",
        )
    return models.TagModel(id=query_result[0], value=value, notes=notes, color=color)


@router.put(
    "/tags/{tag_id}",
    summary="Update a tag value or note.",
    response_model=models.TagModel,
    status_code=status.HTTP_200_OK,
    tags = ["Tags"]
)
async def update_tag(
        tag_id: Annotated[int, Path(title="Used to identify the Tag in question")],
        value: str = Body(...),
        notes: str = Body(...),
        color: str = Body(...),
):
    query_result = db_access.update_tag(tag_id=tag_id, value=value, notes=notes, color=color)
    if not query_result:  # tag exists
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Tag already exists.",
        )
    return models.TagModel(id=query_result[0], value=query_result[1], notes=query_result[2], color=query_result[3])


""" ---------- Processed Batches ------------------------------------------------------------------"""


@router.get(
    "/processed_batches",
    summary="List all processed batches (PT) in the system.",
    response_model=List[models.ProcessedTransactionBatchModel],
    tags=["Processed Batches"]
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
            transaction_count=row[4]
        )
        response.append(entry)
    return response


@router.get(
    "/processed_batch/{batch_id}",
    summary="Get details for a specific processed batch of transactions",
    response_model=models.ProcessedTransactionBatchModel,
    tags=["Processed Batches"]
)
async def get_batch(batch_id: int):
    query_result = db_access.fetch_processed_batch(batch_id)
    """
    INFO     batch: (502, datetime.datetime(2023, 11, 14, 17, 15, 39, 652767), 'Test run', 3) 
    """
    if query_result:
        response = models.ProcessedTransactionBatchModel(
            id=query_result[0],
            run_date=query_result[1],
            notes=query_result[2],
            transaction_batch_id=query_result[3],
            transaction_count=query_result[4],
        )
        return response
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found."
    )


@router.post(
    "/processed_batch/{batch_id}",
    summary="Update details for a specific processed batch of transactions",
    status_code=status.HTTP_200_OK,
    response_model=models.ProcessedTransactionBatchModel,
    tags=["Processed Batches"]
)
async def update_processed_batch(batch_id: int, info: Request):
    json_data = await info.json()
    try:
        new_note = json_data.get('notes')
        db_access.update_processed_batch_note(batch_id, new_note)
        query_result = db_access.fetch_processed_batch(batch_id)
        response = models.ProcessedTransactionBatchModel(
            id=query_result[0],
            run_date=query_result[1],
            notes=query_result[2],
            transaction_batch_id=query_result[3],
            transaction_count=query_result[4],
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to update processed batch details.",
        )


@router.delete(
    "/processed_batch/{batch_id}", status_code=204,
    summary="Remove a specific processed batch of transactions",
    tags=["Processed Batches"]
)
async def delete_batch(batch_id: int):
    db_access.delete_processed_batch(batch_id)


""" ---------- Processed Transactions ----------------------------------------------------------------------"""


@router.get(
    "/processed_transactions",
    response_model=List[models.ProcessedTransactionRecordModel],
    tags=["Processed Transactions"]
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

    transaction_list = {}
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
            if row[0] not in transaction_list:
                transaction_list[row[0]] = tr
            else:
                transaction_list[row[0]].update(tr)
    else:
        logging.info(
            {"message": f"No transactions found for processed batch {batch_id}"}
        )

    return list(transaction_list.values())


@router.get(
    "/processed_transaction/{transaction_id}",
    summary="Get details for a specific processed transaction",
    response_model=models.ProcessedTransactionRecordModel,
    tags=["Processed Transactions"]
)
async def get_processed_transaction(transaction_id: int):
    """
                        0                               1
SELECT   transaction_records.id AS TID, transaction_records.batch_id AS BID,
                            2
         transaction_records.transaction_date,
                            3
         transaction_records.institution_id as BANK_ID,
                            4
         transaction_records.transaction_data,
                            5
         transaction_records.description,
                            6
         transaction_records.amount
                      7                8
         , bank.name as bank_name, bank.key
                     9              10
         , t.id as tag_id, t.value as tag_value
                   11            12
         , tt.transaction_id, tt.tag_id
                   13                       15
         , c.id as category_id, c.value as category_value
             15      16
         , tn.id, tn.note
    """
    transactions = db_access.fetch_transaction(transaction_id=transaction_id)
    batch_id = None

    transaction_record = {}
    if transactions:
        for row in transactions:
            batch_id = row[1]
            tr = models.ProcessedTransactionRecordModel(
                id=row[0],
                processed_batch_id=batch_id,
                transaction_id=row[0],
                institution_id=row[3],
                transaction=parse_transaction_record(row)
            )
            if row[0] not in transaction_record:
                transaction_record[row[0]] = tr
            else:
                transaction_record[row[0]].update(tr)
    else:
        logging.info(
            {"message": f"No transactions found for processed batch {batch_id}"}
        )

    return list(transaction_record[transaction_id])


""" Aggregate Results """


def generate_report_data():
    report_data = reports.ReportData()
    report_data.categories = db_access.load_categories()
    report_data.tags = db_access.load_tags()
    report_data.institutions = db_access.load_institutions()

    return report_data


def build_report_processors(report_data, batch_id):
    all_processors = list()
    for bank in report_data.institutions:
        institution_id = bank[0]
        templates = db_access.query_templates_by_institution(institution_id)
        if templates:
            """
                    0                1                 2                 3                      4
           templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
                        5              6
         , bank.name as bank_name, bank.key
                  7                   8
         , t.id as tag_id, t.value as tag_value
                  9            10 
         , tt.template_id, tt.tag_id
                    11                      12
         , c.id as category_id, c.value as category_value
                    13                      14 
         , q.id AS qualifier_id, q.value as qualifier_value 


            """
            """
         templates: [(7094,                             0  
                      'Cinemark',                       1
                      False,                            2
                      None,                             3
                      2,                                4
                      'Wellsfargo Visa',                5
                      'WLS_VISA',                       6
                      3003,                             7    tag id
                      'Recurring',                      8    tag
                      7094,                             9   template id again
                      3003,                             10   tag id again
                      2005,                             11   category id
                      'Entertainment',                  12   category value
                      5229,                             13   qualifier id
                      'CINEMARK MOVIE CLUB')            14   qualifier value
            """
            proc = report_processor.ReportProcessor(institution_id, templates)
            proc.name = bank[2]
            proc.analyze_data(processed_batch_id=batch_id)
            all_processors.append(proc)

    return all_processors


@router.get("/processed/templates",
            summary="Template Matching Data",
            tags=["Processed Transactions"]
            )
async def query_processed_templates(
        processed_batch_id: int,
        institution_id: Optional[int] = None,
        include_spending: Optional[bool] = True,
        include_missing: Optional[bool] = False,
):
    """
    Builds a json model list transaction to template matches and omissions.
    Grouped by institution
    :param processed_batch_id:
    :param institution_id:
    :param include_spending:
    :param include_missing:
    :return:
    """
    logging.info({
        "message": "Template data requested",
        "batch": processed_batch_id,
        "bank": institution_id,
        "with spending": include_spending,
        "with missing": include_missing
    })

    return template_report(processed_batch_id)


def template_report(batch_id: int):
    """Generate a Template Verification Report from a Processed Batch"""
    report_data = generate_report_data()
    all_processors = build_report_processors(report_data, batch_id)

    reports.Reporting(report_data).template_verification_report(
        all_processors,
        "report_output/template_verification.html",
        include_extras=True,
        include_spending=True,
    )


@router.get("/processed/categories",
            summary="Category Breakdown Report",
            tags=["Processed Transactions"]
            )
async def query_processed_categories(processed_batch_id: int):
    """
    Builds a json model list transactions broken down by categories
    Grouped by institution
    :param processed_batch_id:
    :return:
    """
    logging.info({
        "message": "Category data requested",
        "batch": processed_batch_id
    })

    return category_report(processed_batch_id)


def category_report(batch_id: int):
    """Generate a Category Breakdown Report"""
    report_data = generate_report_data()
    all_processors = build_report_processors(report_data, batch_id)

    reports.Reporting(report_data).category_verification_report(
        all_processors,
        "report_output/categories.html",
    )


@router.get(
    "/saved_filters",
    summary="Get details for a specific processed transaction",
    response_model=List[models.SavedFilterModel],
    tags=["Saved Filters"]
)
async def get_saved_filters():
    filter_data = db_access.load_saved_filters()
    # logging.info(f"Saved filters: {filter_data}")

    filter_list = []
    for f in filter_data:
        #  0   1       2           3           4         5
        # id, name, created, institutions, categories, credit,
        #  6          7              8         9           10
        # tags, match_all_tags, start_date, end_date, search_string
        tag_list = None

        # Tags
        if f[6] and len(f[6]):
            tag_list = []
            tags = f[6].split(',')
            # logging.info(f"Tags: {tags}")
            for tag in tags:
                tag = tag.strip()
                # logging.info(f"--Updated tag: {tag}")
                q = db_access.fetch_tag(tag)
                # logging.info(f"--got query result: {q}")
                if q is not None:
                    tag_list.append(TagModel(
                        id=q[0],
                        value=q[1],
                        notes=q[2],
                        color=q[3]
                    ))

        sf = models.SavedFilterModel(name=f[1], id=f[0], created=f[2], tags=tag_list)
        filter_list.append(sf)
    return filter_list


@router.get(
    "/batch_contents",
    summary="Get details for all transaction batches",
    response_model=List[models.BatchContentsModel],
    tags=["Batch Details"]
)
async def get_batch_contents():
    """
    class BatchContents(BaseModel):
    id: int
    filename: str
    institution_id: int
    batch_id: int
    added_date: datetime
    notes: str
    """
    contents = db_access.load_batch_contents()
    # logging.info(f"Batch Contents: {contents}")

    content_list = []
    for f in contents:
        # id  filename    institution_id  batch_id    added_date  notes
        sf = models.BatchContentsModel(
            id=f[0],
            filename=f[1],
            institution_id=f[2],
            batch_id=f[3],
            added_date=f[4],
            file_date=f[5],
            transaction_count=f[6],
            notes=f[7]
        )
        content_list.append(sf)
    return content_list


@router.get(
    "/batch_contents/{batch_id}",
    summary="Get details for a specific processed transaction batch",
    response_model=List[models.BatchContentsModel],
    tags=["Batch Details"]
)
async def get_contents_from_batch(batch_id: int):
    contents = db_access.load_contents_from_batch(batch_id)
    content_list = []
    for f in contents:
        # id  filename    institution_id  batch_id    added_date  notes
        sf = models.BatchContentsModel(
            id=f[0],
            filename=f[1],
            institution_id=f[2],
            batch_id=f[3],
            added_date=f[4],
            file_date=f[5],
            transaction_count=f[6],
            notes=f[7]
        )
        content_list.append(sf)
    return content_list

