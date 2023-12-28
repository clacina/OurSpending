"""
    uvicorn app.app:app, port=8080
"""
from __future__ import annotations

import logging
from typing import Optional, List
from typing import Annotated

import fastapi
from fastapi import FastAPI, Path
from pydantic import BaseConfig, BaseModel

from fastapi import APIRouter, Query, HTTPException, status, Body, Request

import rest_api.models as models
from common.db_access import DBAccess
from rest_api.template_models import (
    TemplateDetailModel,
    TemplatesDetailReportBuilder,
    TemplateReportModel,
    TemplateDetailReportBuilder,
    TemplateInputModel,
    SingleTemplateReportBuilder,
)
from rest_api.reports import reports
from rest_api.reports import report_processor
from rest_api.models import CategoryModel
from rest_api.models import TagModel
from rest_api.models import QualifierModel


router = APIRouter()
db_access = DBAccess()


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
    summary="Add a new template for a given institituion",
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
    summary="Get details for a specific template.",
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
    response_model=TemplateDetailModel,
)
def update_template(template_id: int, template: TemplateReportModel = Body(...)):
    query_result = db_access.query_templates_by_id(template_id)
    if not query_result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    existing_template = SingleTemplateReportBuilder(query_result).process()
    update_data = template.dict(exclude_unset=True)
    new_template = existing_template.copy(update=update_data)

    # Store updated template in database
    logging.info({
        "message": "Modifying template",
        "original": existing_template,
        "updated ": new_template
    })

    new_template.category = models.CategoryModel(
        id=query_result[0][11],
        value=query_result[0][12]
    )
    if hasattr(template, 'category') and template.category:
        new_template.category = models.CategoryModel(
            id=template.category.id,
            value=''
        )
    if template.tags:
        new_template.tags = template.tags
    # logging.info(f"New Template: {new_template}")
    db_access.update_template(new_template)

    return new_template


class TemplateUpdate(BaseModel):
    institution_id: int | None = None
    category: CategoryModel | None = None
    credit: bool | None = None
    tags: List[TagModel] | None = None
    qualifiers: List[QualifierModel] | None = None
    hint: str | None = None
    notes: str | None = None


@router.patch(
    "/template/{template_id}",
    summary="Update the category for a specific template",
    response_model=TemplateDetailModel,
)
def patch_template(template_id: int,
                   template: TemplateUpdate):
    logging.info("\n\n\n------------------Patching template")
    query_result = db_access.query_templates_by_id(template_id)
    if not query_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unable to find template with id: {template_id}",
        )

    logging.info(f"Query Result: {query_result}")
    logging.info(f"Patch Parameters: {template}")

    existing_template = SingleTemplateReportBuilder(query_result).process()

    update_data = template.dict(exclude_unset=True)
    # logging.info(f"Update_data: {update_data}")
    new_template = existing_template.copy(update=update_data)

    # Store updated template in database
    logging.info({
        "message": "Modifying template",
        "original": existing_template,
        "updated ": new_template
    })

    if hasattr(template, 'category') and template.category is not None:
        new_template.category = models.CategoryModel(
            id=template.category.id,
            value=template.category.value
        )
    if template.tags:
        # logging.info(f"Tags: {template.tags}")
        new_template.tags = template.tags

    # logging.info(f"New Template: {new_template}")
    db_access.update_template(new_template)

    return new_template

""" ---------- Batches ---------------------------------------------------------------------------"""


@router.get(
    "/batches",
    summary="List all transaction batches in the system.",
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
    summary="Get list of available categories.",
    response_model=List[models.CategoryModel],
)
async def get_categories():
    query_result = db_access.load_categories()
    response = []
    for q in query_result:
        cat = models.CategoryModel(
            id=q[0],
            value=q[1],
            notes=q[2]
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
)
async def update_category(
    category_id: int,
    value: str = Body(...),
    notes: str = Body(...),
):
    try:
        db_access.update_category(category_id=category_id, value=value, notes=notes)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Specified Category already exists.",
        )
    return models.CategoryModel(id=category_id, value=value, notes=notes)


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
        inst = models.InstitutionsModel(id=q[0], key=q[1], name=q[2], notes=q[3])
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

    new_id = db_access.create_institution(data["key"], data["name"], data.get('notes', None))
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


@router.put(
    "/institution/{institution_id}",
    summary="Update the details for an institution",
    response_model=models.InstitutionsModel,
)
async def update_institution(institution_id: int, info: Request=None):
    data = await info.json()
    try:
        db_access.update_institution(institution_id=institution_id, name=data["name"], key=data["key"], notes=data["notes"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to update specified institution.",
        )
    return models.InstitutionsModel(id=institution_id, name=data["name"], key=data["key"], notes=data["notes"])


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
            notes=q[2],
            color=q[3]
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
    cat = models.TagModel(id=q[0], value=q[1], notes=q[2], color=q[3])

    return cat


@router.post(
    "/tags",
    summary="Create a new tag keyphrase.",
    response_model=models.TagModel,
    status_code=status.HTTP_201_CREATED,
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
    return models.TagModel(id=query_result[0], value=query_result[1], notes=query_result[2], color=query_result[3])


@router.put(
    "/tags/{tag_id}",
    summary="Update a tag value or note.",
    response_model=models.TagModel,
    status_code=status.HTTP_200_OK
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

""" ---------- Transactions ----------------------------------------------------------------------"""


@router.get("/transactions",
            summary="Get list of Transactions from a given transaction Batch",
            response_model=List[models.TransactionRecordModel])
async def get_transactions(batch_id: int, limit: int = 100, offset: int = 0):
    transactions = db_access.query_transactions_from_batch(
        batch_id=batch_id, offset=offset, limit=limit
    )

    transaction_set = {}
    for tr in transactions:
        try:
            model = parse_transaction_record(tr)
            if model.id not in transaction_set:
                transaction_set[model.id] = model
            else:
                transaction_set[model.id].update(model)
        except Exception as e:
            logging.info(f"Got exception: {str(e)}")

    return list(transaction_set.values())


def parse_transaction_record(row):
    # logging.info(f"Row len: {len(row)}")
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
    txn_notes = []
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
    if row[15] is not None:
        txn_notes.append(models.TransactionNoteModel(
            transaction_id=row[0],
            id=row[15],
            note=row[16]
        ))

    # logging.info(f"Row: {row}")
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
                key=row[8],
                name=row[7]
            ),
            transaction_date=row[2],
            transaction_data=row[4],
            tags=txn_tags,
            description=row[5],
            amount=row[6],
            notes=txn_notes,
            category=txn_category
        )
        return tr
    except Exception as e:
        logging.exception(f"Can't create model {str(e)}")
        raise e


@router.get(
    "/transaction/{transaction_id}",
    summary="Get details for a specific transaction",
    response_model=models.TransactionRecordModel,
)
async def get_transaction(transaction_id: int):
    transaction = db_access.fetch_transaction(
        transaction_id=transaction_id
    )
    transaction_list = []
    for tr in transaction:
        try:
            model = parse_transaction_record(tr)
            if len(transaction_list):
                transaction_list[0].update(model)
            else:
                transaction_list.append(model)
        except Exception as e:
            logging.info(f"Got exception: {str(e)}")

    if transaction_list:
        return transaction_list[0]

    return fastapi.Response(status_code=404)


@router.get(
    "/transaction/{transaction_id}/notes",
    summary="Get notes for a specific transaction",
    response_model=List[models.TransactionNoteModel],
)
async def get_transaction_notes(transaction_id: int):
    notes = db_access.query_notes_for_transaction(transaction_id=transaction_id)

    note_list = []
    for t in notes:
        tt = models.TransactionNoteModel(id=t[0], note=t[1], transaction_id=transaction_id)
        note_list.append(tt)
    return note_list


@router.put(
    "/transaction/{transaction_id}/category",
    summary="Add a category to the given transaction",
    response_model=models.TransactionRecordModel,
)
async def add_transaction_category(transaction_id: int, category_id: int):
    db_access.assign_category_to_transaction(transaction_id, category_id)

    transaction = db_access.fetch_transaction(
        transaction_id=transaction_id
    )

    transaction_list = []
    for tr in transaction:
        try:
            model = parse_transaction_record(tr)
            if len(transaction_list):
                transaction_list[0].category = category_id
            else:
                transaction_list.append(model)
        except Exception as e:
            logging.exception(f"Got exception: {str(e)}")

    return_data = transaction_list[0]
    return return_data


@router.put(
    "/transaction/{transaction_id}/notes",
    summary="Add a note to the given transaction",
    response_model=models.TransactionRecordModel,
)
async def add_transaction_note(transaction_id: int, info: Request):
    json_data = await info.json()

    db_access.add_note_to_transaction(transaction_id, json_data['note'])

    transaction = db_access.fetch_transaction(
        transaction_id=transaction_id
    )

    transaction_list = []
    for tr in transaction:
        try:
            model = parse_transaction_record(tr)
            if len(transaction_list):
                transaction_list[0].update(model)
            else:
                transaction_list.append(model)
        except Exception as e:
            logging.exception(f"Got exception: {str(e)}")

    return_data = transaction_list[0]
    return return_data


@router.post(
    "/transaction/{transaction_id}/notes",
    summary="Reset notes for the given transaction",
    response_model=models.TransactionRecordModel,
)
async def reset_transaction_notes(transaction_id: int, info: Request):
    """
    Expects a list of notes:
    {
        id - if id > 1696979343781 then new note
        text - new or updated note text
    }
    """
    json_data = await info.json()

    db_access.clear_transaction_notes(transaction_id=transaction_id)
    for note in json_data:
        db_access.add_note_to_transaction(transaction_id, note['text'])

    transaction = db_access.fetch_transaction(
        transaction_id=transaction_id
    )

    result_transaction = None
    for tr in transaction:
        try:
            model = parse_transaction_record(tr)
            if result_transaction:
                result_transaction.update(model)
            else:
                result_transaction = model
        except Exception as e:
            logging.exception(f"Got exception: {str(e)}")

    return_data = result_transaction
    return return_data


@router.put(
    "/transaction/{transaction_id}/tags",
    summary="Reset the tags for a given transaction",
    response_model=models.TransactionRecordModel,
)
async def reset_transaction_tags(
    transaction_id: int,
    tag_ids: List[int] = None,
):
    sql = 'delete from transaction_tags where transaction_id=%(transaction_id)s'
    query_params = {'transaction_id': transaction_id}
    conn = db_access.connect_to_db()
    assert conn
    cur = conn.cursor()

    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        logging.exception(f"Error removing transaction tags {transaction_id}: {str(e)}")
        raise e

    for tag in tag_ids:
        db_access.add_tag_to_transaction(transaction_id, tag)

    transaction = db_access.fetch_transaction(
        transaction_id=transaction_id
    )

    transaction_list = []
    for tr in transaction:
        try:
            model = parse_transaction_record(tr)
            if len(transaction_list):
                transaction_list[0].update(model)
            else:
                transaction_list.append(model)
        except Exception as e:
            logging.exception(f"Got exception: {str(e)}")

    return_data = transaction_list[0]
    return return_data


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
        # sql = """SELECT tag_id, t.id, t.value, t.notes, t.color FROM transaction_tags
        tt = models.TagModel(id=t[0], value=t[2], notes=t[3], color=t[4])
        tag_list.append(tt)
    return tag_list


@router.get(
    "/transactions_descriptions",
    summary="List the column definitions for each bank's data format.",
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
    summary="List all processed batches (PT) in the system.",
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
            transaction_count=row[4]
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


@router.get("/processed/templates", summary="Template Matching Data")
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


@router.get("/processed/categories", summary="Category Breakdown Report")
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
)
async def get_saved_filters():
    filter_data = db_access.load_saved_filters()
    logging.info(f"Saved filters: {filter_data}")

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
            logging.info(f"Tags: {tags}")
            for tag in tags:
                tag = tag.strip()
                logging.info(f"--Updated tag: {tag}")
                q = db_access.fetch_tag(tag)
                logging.info(f"--got query result: {q}")
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
