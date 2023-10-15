import random
from rest_api.test import helpers
import pytest

# append the path of the parent directory
# sys.path.append("..")

from starlette.testclient import TestClient
from rest_api.app import app
import logging

client = TestClient(app)


# @pytest.mark.parametrize("num, output",[(1,11),(2,22),(3,35),(4,44)])
# def test_multiplication_11(num, output):


def test_ping():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"ping": "pong!"}


def test_get_batch():
    batch_ids = helpers.get_batch_ids()
    response = client.get(f"/batch/{random.choice(batch_ids)}")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry
    assert "run_date" in entry
    assert "notes" in entry


def test_get_bad_batch():
    response = client.get("/batch/9999")
    assert response.status_code == 404


def test_get_batches():
    response = client.get("/batches")
    assert response.status_code == 200
    assert len(response.json()) >= 1, f"Empty payload: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry
    assert "run_date" in entry
    assert "notes" in entry


def test_get_category():
    response = client.get("/category/5")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry
    assert 'value' in entry


def test_get_bad_category():
    response = client.get("/category/-5")
    assert response.status_code == 404


def test_get_categories():
    response = client.get("/categories")
    assert response.status_code == 200
    assert len(response.json()) > 1, f"Empty payload: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry


def test_create_category():
    test_category = {
        'value': f'Stuff for Nolia {random.randint(0, 100)}',
        'notes': 'Category Notes'
    }
    print(f"Creating {test_category}")
    response = client.post("/categories",
                           json=test_category,
                           headers={"Content-Type": "application/json"})
    assert response.status_code == 201

    # try again with same value, should get a 422
    response = client.post("/categories",
                           json=test_category,
                           headers={"Content-Type": "application/json"})
    assert response.status_code == 422


# def test_update_category():
#     test_category = f'Stuff for Nolia {random.randint(0, 100)}'
#     print(f"Updating to {test_category}")
#     response = client.put("/category/1", data={'value': test_category})
#     assert response.status_code == 200
#
#     response = client.get("/category/1")
#     assert response.status_code == 200
#     entry = response.json()
#     assert "id" in entry
#     assert 'value' in entry
#     assert entry['value'] == test_category


def test_get_institution():
    response = client.get("/institution/4")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry


def test_get_institutions():
    response = client.get("/institutions")
    assert response.status_code == 200
    assert len(response.json()) > 1, f"Empty payload: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry


def test_get_qualifier():
    response = client.get("/qualifier/34")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry
    assert "value" in entry
    assert "institution_id" in entry


def test_get_qualifiers():
    response = client.get("/qualifiers")
    assert response.status_code == 200
    assert len(response.json()) > 1, f"Empty payload: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry
    assert "value" in entry
    assert "institution_id" in entry


def test_get_tag():
    response = client.get("/tag/2")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry


def test_get_tags():
    response = client.get("/tags")
    assert response.status_code == 200
    assert len(response.json()) > 1, f"Empty payload: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry


def test_get_template():
    response = client.get("/template/23")
    assert response.status_code == 200, print(f"Error response: {response.status_code}: {response.json()}")
    entry = response.json()
    logging.info(f"Template Resp: {entry}")
    assert "id" in entry
    assert "institution" in entry
    assert "category" in entry
    assert "credit" in entry
    assert "tags" in entry
    assert "qualifiers" in entry
    assert "hint" in entry
    assert "notes" in entry
    assert isinstance(entry["tags"], list)
    assert isinstance(entry["qualifiers"], list)


def test_get_template_nonexistent():
    response = client.get("/template/33323")
    assert response.status_code == 404, print(f"Error response: {response.status_code}: {response.json()}")


def test_get_templates():
    response = client.get("/templates")
    assert response.status_code == 200
    assert len(response.json()) > 1, f"Empty payload: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry
    assert "institution" in entry
    assert "category" in entry
    assert "credit" in entry
    assert "tags" in entry
    assert "qualifiers" in entry
    assert "hint" in entry
    assert "notes" in entry
    assert isinstance(entry["tags"], list)
    assert isinstance(entry["qualifiers"], list)


def test_get_transaction():
    tid = random.choice(helpers.get_transaction_ids())
    response = client.get(f"/transaction/{tid}")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry


def test_get_transactions_from_batch():
    bid = random.choice(helpers.get_batch_ids())
    response = client.get(f"/transactions?batch_id={bid}&limit=12")
    assert response.status_code == 200
    assert len(response.json()) >= 1, f"Empty payload: {response.json()}"
    assert len(response.json()) == 12, f"Wrong size payload returned: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry


@pytest.mark.skip(reason="NYI")
def test_add_template():
    pass


@pytest.mark.skip(reason="NYI")
def test_update_template():
    pass


@pytest.mark.skip(reason="NYI")
def test_update_category():
    pass


@pytest.mark.skip(reason="NYI")
def test_create_institution():
    pass


@pytest.mark.skip(reason="NYI")
def test_add_qualifier():
    pass


@pytest.mark.skip(reason="NYI")
def test_add_tag_existing_tag():
    pass


@pytest.mark.skip(reason="NYI")
def test_update_tag_error():
    pass


@pytest.mark.skip(reason="NYI")
def test_get_transaction_notes():
    pass


@pytest.mark.skip(reason="NYI")
def test_add_transaction_note():
    pass


@pytest.mark.skip(reason="NYI")
def test_reset_transaction_notes():
    pass


@pytest.mark.skip(reason="NYI")
def test_reset_transaction_tags():
    pass


@pytest.mark.skip(reason="NYI")
def test_get_transaction_tags():
    pass


def test_get_transaction_descriptions():
    response = client.get(f"/transactions_descriptions")
    assert response.status_code == 200
    entry = response.json()[0]
    assert "id" in entry
    assert "column_name" in entry
    assert "data_id" in entry
    assert "institution_id" in entry


def test_get_processed_batches():
    response = client.get(f"/processed_batches")
    assert response.status_code == 200
    entry = response.json()[0]
    assert "id" in entry
    assert "run_date" in entry
    assert "notes" in entry
    assert "transaction_batch_id" in entry


def test_get_processed_batch():
    bid = random.choice(helpers.get_processed_batch_ids_with_transactions())
    response = client.get(f"/processed_batch/{bid}")
    assert response.status_code == 200
    print(f"Batch id {bid}")
    entry = response.json()
    assert "id" in entry
    assert "run_date" in entry
    assert "notes" in entry
    assert "transaction_batch_id" in entry


def test_get_processed_batch_non_existent():
    response = client.get(f"/processed_batch/9999999")
    assert response.status_code == 404


def test_get_processed_transactions():
    bid = random.choice(helpers.get_processed_batch_ids_with_transactions())
    print(f"Calling with batch id {bid}")
    response = client.get(f"/processed_transactions?batch_id={bid}")
    assert response.status_code == 200
    print(f"Batch id {bid}")
    entry = response.json()
    assert type(entry) == list
    for e in entry:
        assert "id" in e
        assert "processed_batch_id" in e
        assert "transaction" in e


def test_get_processed_transactions_bad_batch():
    response = client.get(f"/processed_transactions?batch_id=99999")
    assert response.status_code == 200
    assert response.json() == []


def test_get_processed_transaction():
    bid = random.choice(helpers.get_processed_batch_ids_with_transactions())
    transaction_id = random.choice(helpers.get_transaction_ids_from_batch(bid))
    print(f"Using bid of {transaction_id}")
    response = client.get(f"/transaction/{transaction_id}")
    assert response.status_code == 200, f"Error fetching processed_transactions for {transaction_id}"
    entry = response.json()
    print(entry)
    assert type(entry) == dict
    assert "id" in entry
    assert "batch_id" in entry
    assert "transaction_data" in entry
    assert "institution" in entry


def test_get_processed_transaction_non_existent():
    response = client.get(f"/transaction/-1")
    assert response.status_code == 404


"""
add_template
update_template
update_category
create_institution
add_qualifier
add_tag - existing tag
update_tag - error
get_transaction_notes
add_transaction_note
reset_transaction_notes
reset_transaction_tags
get_transaction_tags
get_transaction_descriptions
get_processed_batches
get_batch
get_processed_transactions
get_processed_transaction
"""
