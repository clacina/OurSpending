import sys

# append the path of the
# parent directory
sys.path.append("..")

from common import db_access
from data_processing.data_models import *
import json
from typing import Optional


def load_templates(institution_id: Optional[int] = -1):
    conn = db_access.connect_to_db()
    assert conn
    cur = conn.cursor()

    entities = list()
    sql = "SELECT id, institution_id, category_id, credit, hint, notes FROM templates"
    query_params = {}
    if institution_id != -1:
        sql += " WHERE institution_id=%(institution_id)s"
        query_params = {"institution_id": institution_id}

    try:
        cur.execute(sql, query_params)
        rows = cur.fetchall()
        for row in rows:
            entity = BankingTemplate()
            entity.parse(row)
            entities.append(entity)
    except Exception as e:
        print(f"Error loading Templates: {str(e)}")
        raise e

    return entities


def create_transaction_batch():
    conn = db_access.connect_to_db()
    assert conn
    sql = "INSERT INTO transaction_batch (notes) VALUES('test run') RETURNING id"
    cur = conn.cursor()
    try:
        cur.execute(sql)
        conn.commit()
        result = cur.fetchone()
        return result[0]
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e


def update_batch_info(batch_id: int, new_notes: str):
    conn = db_access.connect_to_db()
    assert conn
    sql = "UPDATE transaction_batch SET notes = %(new_notes)s WHERE id=%(batch_id)s"
    cur = conn.cursor()
    query_params = {"new_notes": new_notes, "batch_id": batch_id}
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e


def fetch_transactions_from_batch(batch_id: int, institution_id: Optional[int] = None):
    conn = db_access.connect_to_db()
    assert conn
    sql = """
        SELECT id, institution_id, transaction_date, transaction_data, description, amount, category_id
        FROM
            transaction_records
        WHERE batch_id=%(batch_id)s
    """
    if institution_id:
        sql += " AND institution_id=%(institution_id)s"

    query_params = {"batch_id": batch_id, "institution_id": institution_id}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchall()
        return result
    except Exception as e:
        print(f"Error: {str(e)}")


def add_transaction(conn, transaction, batch_id):
    sql = """
        INSERT INTO
            transaction_records (
                institution_id,
                transaction_date,
                transaction_data,
                batch_id,
                description,
                amount
            )
        VALUES (
            %(inst_id)s, %(transaction_date)s, %(data)s, %(batch_id)s, %(description)s, %(amount)s
        )
    """

    query_params = {
        "inst_id": transaction.institution_id,
        "transaction_date": transaction.date,
        "data": json.dumps(transaction.raw),
        "batch_id": batch_id,
        "description": transaction.description,
        "amount": transaction.amount
    }

    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e


def query_tags(conn, template_id):
    query_params = {}
    sql = "SELECT template_tags.tag_id, t.value FROM template_tags INNER JOIN tags t ON t.id = template_tags.tag_id"
    if template_id:
        sql += " WHERE template_tags.template_id = %(template_id)s"
        query_params = {"template_id": template_id}

    if not conn:
        conn = db_access.connect_to_db()
    assert conn

    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        print(f"Error listing template_tags: {str(e)}")
        raise e


def load_template_qualifiers():
    qualifiers = []
    sql = "SELECT * FROM template_qualifiers"
    conn = db_access.connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        for row in rows:
            inst = TemplateQualifier()
            inst.parse(row)
            qualifiers.append(inst)
    except Exception as e:
        print(f"Error listing template_qualifiers: {str(e)}")
        raise e

    return qualifiers


def load_template_tags(template_id: Optional[int] = None):
    conn = db_access.connect_to_db()
    assert conn
    tags = []
    query_params = {}
    sql = "SELECT * FROM template_tags"
    if template_id:
        sql += " WHERE template_id = %(template_id)s"
        query_params = {"template_id": template_id}

    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        rows = cur.fetchall()
        for row in rows:
            inst = TemplateTag()
            inst.parse(row)
            tags.append(inst)
    except Exception as e:
        print(f"Error listing template_tags: {str(e)}")
        raise e

    return tags


def create_process_batch(transaction_batch_id: int):
    conn = db_access.connect_to_db()
    assert conn
    sql = """
        INSERT INTO 
            processed_transaction_batch (transaction_batch_id, notes) 
        VALUES(
            %(transaction_batch_id)s, %(notes)s
        ) RETURNING id
    """
    cur = conn.cursor()
    query_params = {
        'transaction_batch_id': transaction_batch_id,
        'notes': 'Test run'
    }
    try:
        cur.execute(sql, query_params)
        conn.commit()
        result = cur.fetchone()
        return result[0]
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e


def add_processed_transaction(transaction_id: int,
                              processed_batch_id: int,
                              template_id: Optional[int] = None,
                              institution_id: Optional[int] = None):
    conn = db_access.connect_to_db()
    assert conn
    sql = """
        INSERT INTO
            processed_transaction_records (transaction_id, template_id, processed_batch_id, institution_id)
        VALUES (
            %(transaction_id)s, %(template_id)s, %(processed_batch_id)s, %(institution_id)s
        ) 
    """
    query_params = {
        'transaction_id': transaction_id,
        'template_id': template_id,
        'processed_batch_id': processed_batch_id,
        'institution_id': institution_id
    }

    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e


def fetch_processed_transactions_from_batch(processed_batch_id: int, institution_id: int):
    conn = db_access.connect_to_db()
    assert conn
    sql = """
        SELECT 
            processed_transaction_records.transaction_id, 
            processed_transaction_records.template_id,
            tr.id,
            tr.institution_id,
            tr.transaction_date,
            tr.transaction_data,
            tr.category_id
        FROM
            processed_transaction_records
            JOIN transaction_records tr on processed_transaction_records.transaction_id = tr.id
        WHERE processed_batch_id=%(batch_id)s AND tr.institution_id=%(institution_id)s
    """

    query_params = {"batch_id": processed_batch_id,
                    "institution_id": institution_id}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchall()
        return result
    except Exception as e:
        print(f"Error: {str(e)}")
