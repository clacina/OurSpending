import psycopg2
from psycopg2.errors import UniqueViolation
from typing import List
import logging


def connect_to_db():
    # host = 'localhost'      # Local Server
    host = '10.0.0.20'      # Ubuntu server

    try:
        conn = psycopg2.connect(
            "dbname='lacinaslair' "
            "user='lacinaslair' "
            f"host={host} password='gr8ful'"
        )
        return conn
    except Exception as e:
        logging.exception(f"I am unable to connect to the database:{str(e)}")
        raise e


""" Transactions """


def query_notes_for_transaction(transaction_id):
    sql = """
        SELECT
               note
        FROM
            transaction_notes
        WHERE
            transaction_id=%(transaction_id)s

    """
    query_params = {"transaction_id": transaction_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()

    try:
        cur.execute(sql, query_params)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        logging.exception(f"Error loading transaction notes {transaction_id}: {str(e)}")
        raise e


def query_transactions_from_batch(batch_id, offset=0, limit=10):
    conn = connect_to_db()
    assert conn
    sql = f"{TransactionSQl} WHERE BID=%(batch_id)s"
    sql += " LIMIT %(limit)s OFFSET %(offset)s"
    query_params = {"batch_id": batch_id, "offset": offset, "limit": limit}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchall()
        return result
    except Exception as e:
        logging.exception({"message": f"Error in transaction query: {str(e)}"})
        raise e


def fetch_transaction(transaction_id):
    sql = """
        SELECT
               id, batch_id, institution_id, transaction_date, transaction_data, description, amount
        FROM
            transaction_records
        WHERE
            id=%(transaction_id)s

    """
    query_params = {"transaction_id": transaction_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()

    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        return row
    except Exception as e:
        logging.exception(f"Error loading transaction {transaction_id}: {str(e)}")
        raise e


""" Transaction Batches """


def list_batches():
    conn = connect_to_db()
    assert conn
    sql = "SELECT id, run_date, notes FROM transaction_batch"
    cur = conn.cursor()
    try:
        cur.execute(sql)
        result = cur.fetchall()
        return result
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


def delete_batch(batch_id):
    conn = connect_to_db()
    assert conn
    sql = "DELETE FROM transaction_batch WHERE id=%(batch_id)s"
    query_params = {"batch_id": batch_id}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


def fetch_batch(batch_id: int):
    conn = connect_to_db()
    assert conn
    sql = "SELECT id, run_date, notes FROM transaction_batch WHERE id=%(batch_id)s"
    query_params = {"batch_id": batch_id}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchone()
        return result
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


""" Processed Batches """


def list_processed_batches():
    conn = connect_to_db()
    assert conn
    sql = "SELECT id, run_date, notes, transaction_batch_id FROM processed_transaction_batch"
    cur = conn.cursor()
    try:
        cur.execute(sql)
        result = cur.fetchall()
        return result
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


def fetch_processed_batch(batch_id: int):
    conn = connect_to_db()
    assert conn
    sql = "SELECT id, run_date, notes, transaction_batch_id FROM processed_transaction_batch WHERE id=%(batch_id)s"
    query_params = {"batch_id": batch_id}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchone()
        return result
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


def get_processed_transaction_records(batch_id, offset=0, limit=10):
    conn = connect_to_db()
    assert conn
    sql = f"{ProcessedTransactionSQL} WHERE BID=%(batch_id)s"
    sql += " LIMIT %(limit)s OFFSET %(offset)s"
    query_params = {"batch_id": batch_id, "offset": offset, "limit": limit}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchall()
        return result
    except Exception as e:
        logging.exception({"message": f"Error in transaction query: {str(e)}"})
        raise e


""" Institutions """


def create_institution(key, name):
    conn = connect_to_db()
    assert conn

    sql = """
        INSERT INTO
            institutions (key, name) VALUES (
                %(key)s, %(name)s
            )
        RETURNING id
    """
    query_params = {"key": key, "name": name}

    with conn.cursor() as cursor:
        try:
            cursor.execute(sql, query_params)
            new_id = cursor.fetchone()[0]
            print(f"Got new institution id of {new_id}")
            conn.commit()
            return new_id
        except Exception as e:
            logging.exception(f"Error: {str(e)}")
            raise e


def fetch_institution(institution_id: int):
    conn = connect_to_db()
    assert conn
    sql = "SELECT id, key, name FROM institutions WHERE id=%(institution_id)s"
    query_params = {"institution_id": institution_id}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchone()
        return result
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


def load_institutions():
    conn = connect_to_db()
    assert conn
    sql = "SELECT id, key, name, notes FROM institutions"
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        logging.exception(f"Error listing institutions: {str(e)}")
        raise e


""" Categories """


def load_categories():
    sql = "SELECT id, value, notes FROM categories"
    conn = connect_to_db()
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        logging.exception(f"Error listing categories: {str(e)}")
        raise e


def get_category(category_id):
    sql = "SELECT id, value FROM categories WHERE id=%(category_id)s"
    query_params = {"category_id": category_id}
    conn = connect_to_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        return row
    except Exception as e:
        logging.exception(f"Error fetching category:{category_id}: {str(e)}")
        raise e


def create_category(value: str, notes: str = None):
    conn = connect_to_db()
    assert conn

    sql = "SELECT id FROM categories WHERE value=%(value)s"
    query_params = {"value": value, "notes": notes}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        if row:
            return None
    except Exception as e:
        logging.exception(f"Error searching for category: {str(e)}")
        raise e

    sql = "INSERT INTO categories (value, notes) VALUES (%(value)s, %(notes)s) RETURNING id"
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        conn.commit()
        return row[0], value
    except Exception as e:
        logging.exception(f"Error creating category: {str(e)}")
        raise e


def update_category(category_id: int, value: str, notes: str):
    conn = connect_to_db()
    assert conn

    sql = "UPDATE categories SET value=%(value)s, notes=%(notes)s WHERE id=%(category_id)s"
    query_params = {"category_id": category_id, "value": value, "notes": notes}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        logging.exception(f"Category specified already exists: {str(e)}")
        raise e


""" templates """


def create_template(
    institution_id: int,
    category: str,
    is_credit: bool,
    hint: str,
    notes: str,
    qualifiers: List[str],
    tags: List[str],
):
    # does institution id exist?
    # TODO: Needs impl
    pass


def fetch_template(template_id: int):
    sql = "SELECT id, institution_id, category_id, credit, hint, notes FROM templates WHERE id=%(template_id)s"
    query_params = {"template_id": template_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        return row
    except Exception as e:
        logging.exception(f"Error fetching template {template_id}: {str(e)}")
        raise e


# -- template.id -> template_tags.template_id
# -- template.id -> template_qualifiers.template_id
# -- template.category_id -> categories.id
# -- template_tags.id -> tags.id
# -- template_qualifiers.qualifier_id -> qualifiers


TemplateSQl = """
WITH tlist AS(
SELECT   templates.id AS TID, templates.hint, templates.credit, templates.notes, templates.institution_id as BANK_ID
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value 
         , tt.template_id, tt.tag_id
         , c.id as category_id, c.value as category_value 
         , q.id AS qualifier_id, q.value as qualifier_value 
         FROM templates
         JOIN institutions bank on templates.institution_id = bank.id
         full outer JOIN template_tags tt on tt.template_id = templates.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on templates.category_id = c.id
         full outer JOIN template_qualifiers tq on templates.id = tq.template_id
         full outer JOIN qualifiers q on tq.qualifier_id = q.id
) 
SELECT * FROM tlist
"""


TransactionSQl = """
WITH tlist AS(
SELECT   transaction_records.id AS TID, transaction_records.batch_id AS BID, 
         transaction_records.transaction_date, 
         transaction_records.institution_id as BANK_ID,
         transaction_records.transaction_data,
         transaction_records.description,
         transaction_records.amount
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value 
         , tt.transaction_id, tt.tag_id
         , c.id as category_id, c.value as category_value 
         , tn.note
         FROM transaction_records
         JOIN institutions bank on transaction_records.institution_id = bank.id
         full outer JOIN transaction_tags tt on tt.transaction_id = transaction_records.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on transaction_records.category_id = c.id
         full outer JOIN transaction_notes tn on transaction_records.id = tn.transaction_id
) 
SELECT * FROM tlist
"""

ProcessedTransactionSQL = """
WITH tlist AS(
SELECT   transaction_records.id AS TID, transaction_records.batch_id, 
         transaction_records.transaction_date, 
         transaction_records.institution_id as BANK_ID,
         transaction_records.transaction_data,
         transaction_records.description,
         transaction_records.amount
         , bank.name as bank_name, bank.key
         , t.id as tag_id, t.value as tag_value 
         , tt.transaction_id, tt.tag_id
         , c.id as category_id, c.value as category_value 
         , tn.note
         FROM transaction_records
         JOIN institutions bank on transaction_records.institution_id = bank.id
         full outer JOIN transaction_tags tt on tt.transaction_id = transaction_records.id
         full OUTER JOIN tags t on t.id = tt.tag_id
         full outer JOIN categories c on transaction_records.category_id = c.id
         full outer JOIN transaction_notes tn on transaction_records.id = tn.transaction_id
),

plist AS (
SELECT   processed_transaction_records.id as PID,
         processed_transaction_records.processed_batch_id as BID, 
         processed_transaction_records.institution_id,
         processed_transaction_records.template_id, processed_transaction_records.transaction_id,
         tr.*         
FROM 
         processed_transaction_records
JOIN 
         tlist tr on processed_transaction_records.transaction_id = tr.TID
)
SELECT * FROM plist
"""


def query_templates_by_id(template_id):
    """
    Used by API to return information about a specific template
    Will list out qualifiers and tags
    :param template_id:
    :return: Json blob
    """
    conn = connect_to_db()
    assert conn

    sql = f"{TemplateSQl} WHERE TID=%(template_id)s"
    query_params = {"template_id": template_id}

    try:
        cur = conn.cursor()
        cur.execute(sql, query_params)
        rows = cur.fetchall()
        # logging.info(f"Returned {len(rows)} matching records.")
        # logging.info(f"Rows: {rows}")
        return rows
    except Exception as e:
        logging.exception(f"Error loading Template {template_id}: {str(e)}")
        raise e


def query_templates_by_institution(institution_id):
    """
    Used by API to return information about a specific template
    Will list out qualifiers and tags
    :param institution_id:
    :return: Json blob
    """
    conn = connect_to_db()
    assert conn

    sql = TemplateSQl

    query_params = {}
    if institution_id >= 0:
        # logging.info(f"Using institution id of {institution_id}")
        sql = f"{TemplateSQl} WHERE BANK_ID=%(institution_id)s"
        query_params = {"institution_id": institution_id}

    try:
        cur = conn.cursor()
        cur.execute(sql, query_params)
        rows = cur.fetchall()
        # logging.info(f"Returned {len(rows)} matching records.")
        # logging.info(f"Rows: {rows}")
        return rows
    except Exception as e:
        logging.exception(f"Error loading Template with institution {institution_id}: {str(e)}")
        raise e


""" Tags """


def query_tags_for_transaction(transaction_id: int):
    tags = []
    sql = "SELECT tag_id FROM transaction_tags WHERE transaction_id=%(transaction_id)s"
    query_params = {"transaction_id": transaction_id}
    conn = connect_to_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        result = cur.fetchall()
        return result
    except Exception as e:
        logging.exception(f"Error: {str(e)}")
        raise e


def load_tags():
    sql = "SELECT id, value, notes FROM tags"
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        logging.exception(f"Error listing tags: {str(e)}")
        raise e


def fetch_tag(tag_id: int):
    sql = "SELECT id, value, notes FROM tags WHERE id=%(tag_id)s"
    query_params = {"tag_id": tag_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        return row
    except Exception as e:
        logging.exception(f"Error fetching tag {tag_id}: {str(e)}")
        raise e


def fetch_tag_by_value(value: str):
    sql = "SELECT id, value, notes FROM tags WHERE value=%(value)s"
    query_params = {"value": value}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        return row
    except Exception as e:
        logging.exception(f"Error fetching tag {value}: {str(e)}")
        raise e


def add_tag_to_transaction(transaction_id, tag_id):
    sql = "INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (%(transaction_id)s, %(tag_id)s)"
    query_params = {"transaction_id": transaction_id, "tag_id": tag_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        conn.commit()
    except Exception as e:
        logging.exception(f"Error attaching tag {tag_id} to transaction {transaction_id}: {str(e)}")
        raise e


def create_tag(value: str):
    conn = connect_to_db()
    assert conn

    sql = "SELECT id FROM tags WHERE value=%(value)s"
    query_params = {"value": value}
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        if row:
            return None
    except Exception as e:
        logging.exception(f"Error searching for tag: {str(e)}")
        raise e

    sql = "INSERT INTO tags (value) VALUES (%(value)s) RETURNING id"
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        conn.commit()
        return row[0], value
    except Exception as e:
        logging.exception(f"Error creating tag: {str(e)}")
        raise e


""" Qualifiers """


def create_qualifer(value: str, institution_id: int):
    """Create a new entry in the qualifiers table and return the new id"""
    sql = """
        INSERT INTO 
            qualifiers (value, institution_id)
        VALUES (%(value)s, %(institution_id)s)
        RETURNING id
    """
    query_params = {"value": value, "institution_id": institution_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        new_id = cur.fetchall()
        print(f"Got new id of {new_id}")
        conn.commit()
        return new_id
    except UniqueViolation as uv:
        logging.exception(f"Error inserting qualifier {value}: {str(uv)}")
        raise uv

    except Exception as e:
        logging.exception(f"Error inserting qualifier {value}: {str(e)}")
        raise e


def fetch_qualifier(qualifier_id: int):
    """retrieve a single qualifier record by id"""
    sql = "SELECT id, value, institution_id FROM qualifiers WHERE id=%(qualifier_id)s"
    query_params = {"qualifier_id": qualifier_id}
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql, query_params)
        row = cur.fetchone()
        return row
    except Exception as e:
        logging.exception(f"Error fetching qualifier {qualifier_id}: {str(e)}")
        raise e


def load_qualifiers():
    """load all qualifier records"""
    sql = "SELECT id, value, institution_id FROM qualifiers"
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        logging.exception(f"Error listing qualifiers: {str(e)}")
        raise e


def create_qualifer_from_transaction(conn, transaction_id):
    # get transaction and pull description
    transaction = fetch_transaction(transaction_id)
    assert transaction
    """ Transaction -- 
    ------------------+--------
     id               | integer
     batch_id         | integer
     institution_id   | integer
     transaction_date | date   
     transaction_data | jsonb  
     notes            | text       
    (44, 1, 4, datetime.date(2023, 1, 25),
     ['01/25/2023', '01/25/2023', 'ALEXA SKILLS*DY07F7BL3 AM', 'Shopping', 'Sale', '-0.88', ''], 'Manual Entry')
    """
    desc = transaction[4][2]
    logging.info(
        {"message": "Creating Qualifier", "data": transaction, "new qualifier": desc}
    )

    qid = create_qualifer(desc)
    logging.info(f"New qualifier: {qid}")
    return qid


def load_transaction_data_descriptions():
    sql = "SELECT id, institution_id, column_number, column_name, column_type, is_description, is_amount, data_id from transaction_data_description"
    conn = connect_to_db()
    assert conn
    cur = conn.cursor()
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return rows
    except Exception as e:
        logging.exception(f"Error listing transaction_data_description records: {str(e)}")
        raise e
