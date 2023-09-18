from fastapi.testclient import TestClient
from app import user_model
from app.app import app


client = TestClient(app)


def test_get_user():
    user = user_model.get_user("clacina@gmail.com")
    assert user is None


# def test_create_user():
#     user = db_access.create_user("clacina@mindspring.com", "password")
#     assert user



headers = {
    'X-Token': '',
}


def test_login():
    response = client.get('/')
    assert response.status_code == 200

    client.post('/login', headers=headers, json={'email': 'clacina@mindspring.com', 'password': 'password'})

