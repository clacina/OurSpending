from data_processing.db_utils import fetch_processed_transactions_from_batch


def test_processed_batch_retrieval():
    result = fetch_processed_transactions_from_batch(1, 11)
    print(result)
