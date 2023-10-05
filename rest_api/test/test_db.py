from common import db_access
from test import helpers


def test_fetch_transaction():
    transaction_id = 24
    transaction = db_access.fetch_transaction(
        transaction_id=transaction_id
    )
    assert transaction


def test_list_batches():
    """
    [(1, datetime.datetime(2023, 10, 4, 15, 6, 14, 384050), '0 Processors, 0 Transactions'),
     (2, datetime.datetime(2023, 10, 4, 15, 52, 18, 432851), '0 Processors, 0 Transactions'),
     (3, datetime.datetime(2023, 10, 4, 15, 55, 9, 763197), 'test run'),
     (4, datetime.datetime(2023, 10, 4, 15, 55, 30, 7891), 'test run'),
     (5, datetime.datetime(2023, 10, 4, 15, 56, 45, 139638), '0 Processors, 0 Transactions'),
     (6, datetime.datetime(2023, 10, 4, 15, 57, 13, 480925), 'test run'),
     (7, datetime.datetime(2023, 10, 4, 15, 58, 32, 272188), 'test run'),
     (8, datetime.datetime(2023, 10, 4, 15, 59, 2, 713811), 'test run'),
     (9, datetime.datetime(2023, 10, 4, 15, 59, 33, 843547), '11 Processors, 758 Transactions')
    ]
    """
    result = db_access.list_batches()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 3


def test_fetch_batch():
    """
    (1, datetime.datetime(2023, 10, 4, 15, 6, 14, 384050), '0 Processors, 0 Transactions')
    """
    batch_list = helpers.get_batch_ids()
    result = db_access.fetch_batch(batch_id=batch_list[0])
    assert result
    assert len(result) == 3


def test_delete_batch():
    batch_list = helpers.get_batch_ids()
    db_access.delete_batch(batch_id=batch_list[0])
    new_batch_list = db_access.list_batches()
    assert len(new_batch_list) == len(batch_list) - 1


def test_load_categories():
    result = db_access.load_categories()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 3


def test_load_institutions():
    result = db_access.load_institutions()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 4


def test_load_tags():
    result = db_access.load_tags()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 4


def test_load_qualifiers():
    result = db_access.load_qualifiers()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 3


def test_load_transaction_data_descriptions():
    result = db_access.load_transaction_data_descriptions()
    assert result
    assert len(result) > 1


def test_list_processed_batches():
    result = db_access.list_processed_batches()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 4

"""
    ---------  db_access.py methods  ----------------
X   def list_batches():
X   def fetch_batch(batch_id: int):
X   def delete_batch(batch_id):

    def query_notes_for_transaction(transaction_id):
    def query_transactions_from_batch(batch_id, offset=0, limit=10):
    def add_tag_to_transaction(transaction_id, tag_id):

X   def load_categories():
    def create_category(value: str, notes: str = None):
    def get_category(category_id):
    def update_category(category_id: int, value: str, notes: str):

X   def load_institutions():
    def create_institution(key, name):
    def fetch_institution(institution_id: int):

X   def load_qualifiers():
    def create_qualifer(value: str, institution_id: int):
    def create_qualifer_from_transaction(conn, transaction_id):
    def fetch_qualifier(qualifier_id: int):

X   def load_tags():
    def create_tag(value: str, notes: str, color: str):
    def fetch_tag(tag_id: int):
    def fetch_tag_by_value(value: str):
    def update_tag(tag_id: int, value: str, notes: str, color: str):

    def create_template(
    def fetch_template(template_id: int):
    def query_templates_by_id(template_id):
    def query_templates_by_institution(institution_id):

X   def load_transaction_data_descriptions():

X   def fetch_transaction(transaction_id)

X   def list_processed_batches():
    def fetch_processed_batch(batch_id: int):

    def get_processed_transaction_records(batch_id, offset=0, limit=10):

    def query_tags_for_transaction(transaction_id: int):
"""
