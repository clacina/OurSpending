import random

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

from common.db_access import DBAccess
from rest_api.test import helpers
import pytest
from rest_api.test import models

url = URL.create(
    drivername="postgresql",
    username="lacinaslair",
    host="10.0.0.100",
    database="lacinaslair"
)

engine = create_engine(url)
Session = sessionmaker(bind=engine)


@pytest.fixture(scope="module")
def db_session():
    models.Base.metadata.create_all(engine)
    session = Session()
    yield session
    session.rollback()
    session.close()


# @pytest.fixture(scope="module")
# def valid_author():
#     valid_author = Author(
#         firstname="Ezzeddin",
#         lastname="Aybak",
#         email="aybak_email@gmail.com"
#     )
#     return valid_author


db_access = DBAccess()


def test_fetch_transaction(db_session):
    transactions_list = db_session.query(models.TransactionRecords).all()
    transaction_id = random.choice(transactions_list).id

    # tids = helpers.get_transaction_ids()
    # transaction_id = random.choice(tids)
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
    result = helpers.list_batches()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 3


def test_fetch_batch():
    """
    (1, datetime.datetime(2023, 10, 4, 15, 6, 14, 384050), '0 Processors, 0 Transactions')
    """
    batch_list = helpers.get_batch_ids()
    result = helpers.fetch_batch(batch_id=batch_list[0])
    assert result
    assert len(result) == 3


@pytest.mark.skip(reason="Destructive so skipping")
def test_delete_batch():
    batch_list = helpers.get_batch_ids()
    helpers.delete_batch(batch_id=batch_list[0])
    new_batch_list = helpers.list_batches()
    assert len(new_batch_list) == len(batch_list) - 1


def test_load_categories():
    result = helpers.load_categories()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 4  # num fields


def test_load_institutions():
    result = helpers.load_institutions()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 5


def test_load_tags():
    result = helpers.load_tags()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 4


def test_load_qualifiers():
    result = helpers.load_qualifiers()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 3


def test_load_transaction_data_descriptions():
    result = helpers.load_transaction_data_descriptions()
    assert result
    assert len(result) > 1


def test_list_processed_batches():
    result = db_access.list_processed_batches()
    assert result
    assert len(result) > 0
    assert len(result[0]) == 5


"""  New tests - 3/26/2024 """


def test_query_notes_for_transaction():
    data = helpers.find_transaction_with_notes()
    # [(8000, 4900, 'Testing Note actions'), (8001, 4901, 'Note Test')]
    assert data
    result = db_access.query_notes_for_transaction(data[0][1])
    # print(f"Result: {result}")
    # [(8000, 4900, 'Testing Note actions'), (8001, 4901, 'Note Test')]
    assert len(result) > 0
    assert result[0][1] == data[0][1]


"""
    ---------  db_access.py methods  ----------------

    def query_notes_for_transaction(self, transaction_id):
    def clear_transaction_notes(self, transaction_id):
    def add_note_to_transaction(self, transaction_id, note):
    def assign_category_to_transaction(self, transaction_id, category_id):
    def query_transactions_from_batch(self, batch_id, institution_id=None, offset=0, limit=10):
    def fetch_transaction(self, transaction_id):
    def list_batches(self):
    def delete_batch(self, batch_id):
    def fetch_batch(self, batch_id: int):
    def list_processed_batches(self):
    def fetch_processed_batch(self, batch_id: int):
    def update_processed_batch_note(self, batch_id, notes):
    def delete_processed_batch(self, batch_id):
    def get_processed_transaction_records(self, batch_id, institution_id=None, offset=0, limit=10):
    def update_processed_transaction(self, transaction_id, template_id):
    def create_institution(self, key, name, notes, class_name=None):
    def fetch_institution(self, institution_id: int):
    def load_institutions(self):
    def update_institution(self, institution_id, name, key, notes, class_name=None):
    def load_categories(self):
    def get_category(self, category_id):
    def create_category(self, value: str, notes: str = None):
    def update_category(self, category_id: int, value: str, is_tax_deductible: bool, notes: str):
    def create_template(self, hint, institution_id, category_id=None, is_credit=False, notes=None, qualifiers=None, tags=None:
    def fetch_template(self, template_id: int):
    def query_templates_by_id(self, template_id):
    def query_templates_by_institution(self, institution_id):
    def update_template(self, new_template):
    def query_templates_qualifiers(self):
    def query_template_qualifier_details(self):
    def query_tags_for_transaction(self, transaction_id: int):
    def load_tags(self):
    def fetch_tag(self, tag_id: int):
    def fetch_tag_by_value(self, value: str):
    def add_tag_to_transaction(self, transaction_id, tag_id):
    def create_tag(self, value: str, notes: str, color: str):
    def update_tag(self, tag_id: int, value: str, notes: str, color: str):
    def create_qualifier(self, value: str, institution_id: int):
    def fetch_qualifier(self, qualifier_id: int):
    def find_qualifier(self, value: str, institution_id: int):
    def load_qualifiers(self):
    def load_qualifiers_with_details(self):
    def load_transaction_data_descriptions(self):
    def load_saved_filters(self):
    def load_batch_contents(self):
    def load_contents_from_batch(self, batch_id):
    def load_cc_info(self):
    def load_cc_data(self, return_most_recent=False):
    def load_loans(self):
    def load_services(self):

"""
