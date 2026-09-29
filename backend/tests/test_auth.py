from tests.helpers import auth_headers
from models import User


def register(client, email, password="testpass123", role="candidate", company_name=None):
    return client.post("/auth/register", json={
        "email": email,
        "password": password,
        "role": role,
        "company_name": company_name,
    })


def test_register_candidate_success(client):
    response = register(client, "candidate@test.com")

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_register_duplicate_email_rejected(client, db_session):
    register(client, "dupe@test.com")

    response = register(client, "dupe@test.com")

    assert response.status_code == 400

    matching_users = (
        db_session.query(User)
        .filter(User.email == "dupe@test.com")
        .count()
    )
    assert matching_users == 1


def test_register_invalid_role_rejected(client):
    response = register(client, "weird@test.com", role="superuser")

    assert response.status_code == 400


def test_register_admin_without_company_name_rejected(client):
    response = register(client, "admin_nocompany@test.com", role="admin")

    assert response.status_code == 400


def test_two_admins_same_company_name_share_company_id(client):
    token_1 = register(client, "founder1@test.com", role="admin", company_name="Shared Co").json()["access_token"]
    token_2 = register(client, "founder2@test.com", role="admin", company_name="Shared Co").json()["access_token"]

    me_1 = client.get("/auth/me", headers=auth_headers(token_1)).json()
    me_2 = client.get("/auth/me", headers=auth_headers(token_2)).json()

    assert me_1["company_id"] == me_2["company_id"]


def test_login_wrong_password_rejected(client):
    register(client, "loginuser@test.com", password="correcthorse")

    response = client.post("/auth/login", json={
        "email": "loginuser@test.com",
        "password": "wrongpassword",
    })

    assert response.status_code == 401


def test_login_unknown_email_rejected(client):
    response = client.post("/auth/login", json={
        "email": "nobody@test.com",
        "password": "whatever",
    })

    assert response.status_code == 401


def test_register_login_me_roundtrip(client):
    register(client, "roundtrip@test.com", password="mypassword")

    login_response = client.post("/auth/login", json={
        "email": "roundtrip@test.com",
        "password": "mypassword",
    })
    token = login_response.json()["access_token"]

    me_response = client.get("/auth/me", headers=auth_headers(token))

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "roundtrip@test.com"
    assert me_response.json()["role"] == "candidate"
