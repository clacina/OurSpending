"""
    uvicorn app.app:app, port=8080
"""
from __future__ import annotations

import logging
from typing import List

import fastapi
from fastapi import APIRouter, Query, HTTPException, status, Body, Request

import models as models
from common.db_access import DBAccess


router = APIRouter()
db_access = DBAccess()

""" ---------- Transactions ----------------------------------------------------------------------"""


@router.get("/transactions",
            summary="Get list of Transactions from a given transaction Batch",
            response_model=List[models.TransactionRecordModel],
            tags=["Transactions"]
            )
async def get_transactions(batch_id: int, institution_id: int = None, limit: int = 100, offset: int = 0):
    transactions = db_access.query_transactions_from_batch(
        batch_id=batch_id, offset=offset, limit=limit, institution_id=institution_id
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
    tags=["Transactions"]
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
    tags=["Transactions"]
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
    tags=["Transactions"]
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
    tags=["Transactions"]
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
    tags=["Transactions"]
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
    logging.info(f"Resetting note: {json_data}")
    db_access.clear_transaction_notes(transaction_id=transaction_id)
    for note in json_data:
        logging.info(f"Adding note to transaction: {note}")
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
    tags=["Transactions"]
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
    tags=["Transactions"]
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
    tags=["Transactions"]
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
            is_transaction_date=row[8],
        )
        transaction_list.append(tr)
    return transaction_list
