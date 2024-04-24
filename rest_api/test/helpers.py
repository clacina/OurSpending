# Helper functions for test routines
import logging

from common.db_access import DBAccess

db_access = DBAccess()


def get_batch_ids():
    result = db_access.list_batches()

    id_list = [x[0] for x in result]
    return id_list


def get_transaction_ids():
    conn = db_access.connect_to_db()
    assert conn

    sql = "select id from transaction_records limit 20"

    try:
        cur = conn.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        id_list = [x[0] for x in rows]
        return id_list
    except Exception as e:
        raise e


def get_processed_batch_ids():
    result = db_access.list_processed_batches()
    print(f"Processed Batches {result}")

    id_list = [x[0] for x in result]
    return id_list


def get_processed_batch_ids_with_transactions():
    """
    Returns a list of ids from processed_transaction_batch.  Each of those batches contain
    a transaction_batch_id that corresponds to the transaction_records table 'batch_id' column
    """
    result = db_access.list_processed_batches()
    id_list = []

    for r in result:
        """            0      1        2              3
        sql = "SELECT id, run_date, notes, transaction_batch_id FROM processed_transaction_batch"
        """
        tx_list = db_access.query_transactions_from_batch(r[3])
        if tx_list and len(tx_list) > 0:
            id_list.append(r[0])
    return id_list


def get_transaction_ids_from_batch(bid):
    result = db_access.query_transactions_from_batch(bid)
    id_list = [x[0] for x in result]
    return id_list


def list_batches():
    return db_access.list_batches()


def fetch_batch(batch_id):
    return db_access.fetch_batch(batch_id)


def delete_batch(batch_id):
    return db_access.delete_batch(batch_id)


def load_categories():
    return db_access.load_categories()


def load_institutions():
    return db_access.load_institutions()


def load_tags():
    return db_access.load_tags()


def load_qualifiers():
    return db_access.load_qualifiers()


def load_transaction_data_descriptions():
    return db_access.load_transaction_data_descriptions()


def find_transaction_with_notes():
    sql = "SELECT id, transaction_id, note FROM transaction_notes"
    conn = db_access.connect_to_db()
    assert conn
    cur = conn.cursor()

    try:
        cur.execute(sql)
        return cur.fetchall()
    except Exception as e:
        logging.exception(f"Error loading transactions with notes : {str(e)}")
        raise e
