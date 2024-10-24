"""
    uvicorn app.app:app, port=8080
"""
from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Query, HTTPException, status, Body, Request

import models as models
from common.db_access import DBAccess

router = APIRouter()
db_access = DBAccess()


""" ---------- Institutions ----------------------------------------------------------------------"""


@router.get(
    "/institutions",
    summary="Get a list of institutions",
    response_model=List[models.InstitutionsModel],
    tags=["Institutions"]
)
async def get_institutions():
    query_result = db_access.load_institutions()
    response = []
    for q in query_result:
        inst = models.InstitutionsModel(id=q[0], key=q[1], name=q[2], notes=q[3], class_name=q[4])
        response.append(inst)

    return response


@router.post(
    "/institutions",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Institution record for processing",
    response_model=models.InstitutionsModel,
    tags=["Institutions"]
)
async def create_institution(info: Request = None):
    data = await info.json()

    new_id = db_access.create_institution(data["key"], data["name"], data.get('notes', None), data.get('class', None))
    inst = models.InstitutionsModel(id=new_id, key=data["key"], name=data["name"], class_name=data[4])
    return inst


@router.get(
    "/institution/{institution_id}",
    summary="Get details for a specific institution",
    response_model=models.InstitutionsModel,
    tags=["Institutions"]
)
async def get_institution(institution_id: int):
    query_result = db_access.fetch_institution(institution_id)
    response = models.InstitutionsModel(
        id=query_result[0], key=query_result[1], name=query_result[2], notes=query_result[3], class_name=query_result[4]
    )
    return response


@router.put(
    "/institution/{institution_id}",
    summary="Update the details for an institution",
    response_model=models.InstitutionsModel,
    tags=["Institutions"]
)
async def update_institution(institution_id: int, info: Request = None):
    data = await info.json()
    try:
        db_access.update_institution(institution_id=institution_id, name=data["name"], key=data["key"],
                                     notes=data["notes"], class_name=data["class"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to update specified institution.",
        )
    return models.InstitutionsModel(id=institution_id, name=data["name"], key=data["key"], notes=data["notes"], class_name=data["class"])


# Credit Card Data
@router.get(
    "/credit_cards",
    summary="Get details for all credit cards",
    response_model=List[models.CreditCardModel],
    tags=["Credit Cards"]
)
async def get_cc_info():
    contents = db_access.load_cc_info()
    # logging.info(f"Credit Info: {contents}")

    content_list = []
    for f in contents:
        # id, name, institution_id, interest_rate, interest_rate_cash, due_date
        sf = models.CreditCardModel(
            id=f[0],
            name=f[1],
            institution_id=f[2],
            interest_rate=f[3],
            interest_rate_cash=f[4],
            due_date=f[5],
            credit_limit=f[6]
        )
        content_list.append(sf)
    return content_list


@router.get(
    "/credit_card_data",
    summary="Get balance info for all cards",
    response_model=List[models.CreditCardDataModel],
    tags=["Credit Cards"]
)
async def get_cc_data():
    contents = db_access.load_cc_data()
    # logging.info(f"Credit Data: {contents}")

    content_list = []
    for f in contents:
        sf = models.CreditCardDataModel(
            card_id=f[0],
            balance=f[1],
            balance_date=f[2],
            minimum_payment=f[3]
        )
        content_list.append(sf)
    return content_list


@router.post(
    "/credit_card_data",
    summary="Update balance information for one or more credit cards.",
    status_code=status.HTTP_201_CREATED,
    tags=["Credit Cards"]
)
async def update_cc_data(info: Request = None):
    cc_data = await info.json()
    logging.info(f"cc data: {cc_data}")
    # Single record and value
    # {'id': 63, 'balance': '344'}
    update_table = None
    update_field = None

    card_id = cc_data.get('id', None)
    assert card_id, f"Payload not properly formatted: {cc_data}"
    query_params = {'card_id': card_id}

    for k, v in cc_data.items():
        logging.info(f"{k}: {v}")
        if k != "id":
            update_field = k
            query_params['placeholder'] = v
        match k:
            case "balance" | "minimum_payment":
                update_table = 'credit_card_data'
            case "credit_limit" | "interest_rate" | "interest_rate_cash" | "due_date":
                update_table = 'credit_cards'

    assert update_field
    if update_table == 'credit_card_data':
        query = f"""
            INSERT INTO {update_table} (card_id, {update_field}) 
            VALUES (%(card_id)s, %(placeholder)s)
            ON CONFLICT (card_id)
            DO UPDATE SET {update_field}=%(placeholder)s
        """
    else:
        query = f"""
            UPDATE {update_table} SET {update_field}=%(placeholder)s WHERE id=%(card_id)s 
        """

    logging.info(f"Insert : {query}")
    logging.info(f"Params : {query_params}")

    conn = db_access.connect_to_db()
    cursor = conn.cursor()

    try:
        cursor.execute(query, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error inserting balance data: {str(e)}")
        raise e

    return await get_cc_data()


@router.get(
    "/credit_card_data/latest",
    summary="Get latest balance info for all cards",
    response_model=List[models.CreditCardDataModel],
    tags=["Credit Cards"]
)
async def get_cc_data():
    contents = db_access.load_cc_data()
    # logging.info(f"Credit Data: {contents}")

    content_list = []
    for f in contents:
        sf = models.CreditCardDataModel(
            card_id=f[0],
            balance=f[1],
            balance_date=f[2],
            minimum_payment=f[3]
        )
        content_list.append(sf)
    return content_list


@router.get(
    "/loans",
    summary="Get latest balance info for all loans",
    response_model=List[models.LoanDataModel],
    tags=["Credit Cards"]
)
async def get_loans():
    contents = db_access.load_loans()
    # logging.info(f"Loans: {contents}")

    content_list = []
    for f in contents:
        sf = models.LoanDataModel(
            id=f[0],
            name=f[1],
            term=f[2],
            term_length=f[3],
            term_rate=f[4],
            balance=f[5],
            payment=f[6],
            due_date=f[7],
            loan_type=f[8],
            notes=f[9]
        )
        content_list.append(sf)
    return content_list


@router.get(
    "/services",
    summary="Get latest balance info for all home services",
    response_model=List[models.ServiceDataModel],
    tags=["Credit Cards"]
)
async def get_services():
    contents = db_access.load_services()

    content_list = []
    for f in contents:
        sf = models.ServiceDataModel(
            id=f[0],
            name=f[1],
            amount=f[2],
            due_date=f[3],
            notes=f[4],
            term_length=f[5]
        )
        content_list.append(sf)
    return content_list
