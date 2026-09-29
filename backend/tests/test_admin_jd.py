from tests.helpers import register_admin, auth_headers, create_jd


def test_admin_can_create_and_read_own_jd(client):
    token = register_admin(client, "owner@test.com", "Company A")
    jd_id = create_jd(client, token)

    response = client.get(f"/admin/jd/{jd_id}")

    assert response.status_code == 200
    assert response.json()["company_name"] == "Company A"


def test_admin_cannot_update_other_companys_jd(client):
    token_a = register_admin(client, "admin_a@test.com", "Company A")
    token_b = register_admin(client, "admin_b@test.com", "Company B")
    jd_id = create_jd(client, token_a)

    response = client.put(
        f"/admin/jd/{jd_id}",
        json={
            "title": "Hijacked",
            "description": "Hijacked",
            "skills": "Hijacked",
        },
        headers=auth_headers(token_b),
    )

    assert response.status_code == 403


def test_admin_cannot_delete_other_companys_jd(client):
    token_a = register_admin(client, "admin_a2@test.com", "Company A")
    token_b = register_admin(client, "admin_b2@test.com", "Company B")
    jd_id = create_jd(client, token_a)

    response = client.delete(
        f"/admin/jd/{jd_id}",
        headers=auth_headers(token_b),
    )

    assert response.status_code == 403


def test_admin_can_update_own_companys_jd(client):
    token = register_admin(client, "owner2@test.com", "Company A")
    jd_id = create_jd(client, token)

    response = client.put(
        f"/admin/jd/{jd_id}",
        json={
            "title": "Updated Title",
            "description": "Updated description",
            "skills": "Python, SQL",
        },
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


def test_list_jds_includes_created_jobs(client):
    token = register_admin(client, "lister@test.com", "Company A")
    create_jd(client, token, title="Job One")
    create_jd(client, token, title="Job Two")

    response = client.get("/admin/jd")

    titles = [job["title"] for job in response.json()]
    assert response.status_code == 200
    assert "Job One" in titles
    assert "Job Two" in titles


def test_get_single_jd_not_found(client):
    response = client.get("/admin/jd/99999")

    assert response.status_code == 404


def test_update_nonexistent_jd_not_found(client):
    token = register_admin(client, "updater@test.com", "Company A")

    response = client.put(
        "/admin/jd/99999",
        json={"title": "x", "description": "x", "skills": "x"},
        headers=auth_headers(token),
    )

    assert response.status_code == 404


def test_delete_own_companys_jd_succeeds_and_removes_it(client):
    token = register_admin(client, "deleter@test.com", "Company A")
    jd_id = create_jd(client, token)

    delete_response = client.delete(f"/admin/jd/{jd_id}", headers=auth_headers(token))
    get_response = client.get(f"/admin/jd/{jd_id}")

    assert delete_response.status_code == 200
    assert get_response.status_code == 404


def test_delete_nonexistent_jd_not_found(client):
    token = register_admin(client, "deleter2@test.com", "Company A")

    response = client.delete("/admin/jd/99999", headers=auth_headers(token))

    assert response.status_code == 404
