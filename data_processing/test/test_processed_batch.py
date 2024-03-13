from data_processing.db_utils import fetch_processed_transactions_from_batch
from data_processing.app import match_qualifiers


def test_processed_batch_retrieval():
    result = fetch_processed_transactions_from_batch(1, 11)
    print(result)


def test_match():
    qualifiers = []
    match_qualifiers(522, qualifiers, 3)

