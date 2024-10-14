"""
    uvicorn app.app:app, port=8080
"""
from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Query, HTTPException, status, Body, Request

import rest_api.models as models
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

    new_balances = cc_data['updated_balance']
    new_minimumPayments = cc_data['updated_payment']

    logging.info(f"balances: {new_balances}")
    logging.info(f"min payments: {new_minimumPayments}")

    conn = db_access.connect_to_db()
    cursor = conn.cursor()

    # Insert new records in db
    for k, v in new_balances.items():
        # Balance: entry_balance_62:
        card_id = k[len('entry_balance_'):]

        if v != '':
            sql = """
                INSERT INTO credit_card_data (card_id, balance, balance_date) 
                VALUES (%(card_id)s, %(balance)s, NOW())
                ON CONFLICT (card_id)
                DO UPDATE SET balance=%(balance)s, balance_date=NOW()
            """
            query_params = {
                'card_id': card_id,
                'balance': v
            }

            print(f"Balance: {k}: {v}")
            print(f"Card: {card_id}")
            try:
                cursor.execute(sql, query_params)
                conn.commit()
            except Exception as e:
                print(f"Error inserting balance data: {str(e)}")
                raise e

        # see if there is a new min payment
        for k, v in new_minimumPayments.items():
            # Minimum Payment: entry_min_payment__62:
            card_id = k[len('entry_min_payment_'):]
            if v != '':
                sql = """
                    INSERT INTO credit_card_data (card_id, balance_date, minimum_payment) 
                    VALUES (%(card_id)s, NOW(), %(min_payment)s)
                    ON CONFLICT (card_id)
                    DO UPDATE SET minimum_payment=%(min_payment)s, balance_date=NOW() 
                """
                query_params = {
                    'card_id': card_id,
                    'min_payment': v
                }
                # ALTER TABLE credit_card_data ADD CONSTRAINT unique_card_id UNIQUE (card_id);
                try:
                    cursor.execute(sql, query_params)
                    conn.commit()
                except Exception as e:
                    print(f"Error inserting payment data: {str(e)}")
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
