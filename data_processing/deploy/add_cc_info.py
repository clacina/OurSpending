import logging
import json
import sys
sys.path.append("../..")
from common.db_access import DBAccess

""" ------------------------------------ Entry Point ------------------------------------"""
with open('../datafiles/cc_data.json') as infile:
    data = infile.read()
    json_data = json.loads(data)


db_access = DBAccess()
conn = db_access.connect_to_db()
assert conn
cur = conn.cursor()


for cc in json_data:
    """
    "name": "Capital One Visa",
    "Balance": 568.52,
    "Limit": 9150.00,
    "Due Date": 28,
    "Min Payment": 22,
    "Rate": 30.74,
    "RateCash": 30.15
    """
    print(cc)

    sql_cc = """
        INSERT INTO credit_cards (name, due_date, interest_rate, interest_rate_cash, credit_limit)
        VALUES(%(name)s, %(due_date)s, %(interest_rate)s, %(interest_rate_cash)s, %(credit_limit)s)
        RETURNING id
    """
    query_params = {
        "name": cc['name'],
        "due_date": cc['Due Date'],
        "interest_rate": cc['Rate'],
        "interest_rate_cash": cc['RateCash'],
        "credit_limit": cc['Limit']
    }

    try:
        cur.execute(sql_cc, query_params)
        conn.commit()
        row = cur.fetchone()
        card_id = row[0]
    except Exception as e:
        logging.exception(f"Error adding card {sql_cc}: {str(e)}")
        raise e

    sql_balance = """
        INSERT INTO credit_card_data (card_id, balance, balance_date, minimum_payment)
        VALUES (%(card_id)s, %(balance)s, '2024-02-23 ', %(min_payment)s)
    """

    query_params = {
        "card_id": card_id,
        "balance": cc['Balance'],
        "min_payment": cc['Min Payment']
    }

    try:
        cur.execute(sql_balance, query_params)
        conn.commit()
    except Exception as e:
        logging.exception(f"Error adding card balance info {sql_balance}: {str(e)}")
        raise e
