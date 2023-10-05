import random
import sys

# append the path of the
# parent directory
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
    response = client.get("/batch/1")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry
    assert "run_date" in entry
    assert "notes" in entry


def test_get_bad_batch():
    response = client.get("/batch/99")
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
    response = client.get("/transaction/43")
    assert response.status_code == 200
    entry = response.json()
    assert "id" in entry


def test_get_transactions_from_batch():
    response = client.get("/transactions?batch_id=9&limit=12")
    assert response.status_code == 200
    assert len(response.json()) >= 1, f"Empty payload: {response.json()}"
    assert len(response.json()) == 12, f"Wrong size payload returned: {response.json()}"
    entry = response.json()[0]
    assert "id" in entry
