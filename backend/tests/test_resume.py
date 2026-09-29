from tests.helpers import register_candidate, auth_headers, make_pdf_bytes, upload_resume


def test_upload_resume_success(client):
    token = register_candidate(client, "resume_owner@test.com")

    response = client.post(
        "/resume/upload",
        files={"file": ("resume.pdf", make_pdf_bytes("Backend developer, 5 years"), "application/pdf")},
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "uploaded"


def test_second_upload_updates_existing_resume(client):
    token = register_candidate(client, "resume_updater@test.com")

    first_id = upload_resume(client, token, "First version")
    second_response = client.post(
        "/resume/upload",
        files={"file": ("resume.pdf", make_pdf_bytes("Second version"), "application/pdf")},
        headers=auth_headers(token),
    )

    assert second_response.status_code == 200
    assert second_response.json()["status"] == "updated"
    assert second_response.json()["resume_id"] == first_id


def test_get_resume_not_found_when_none_uploaded(client):
    token = register_candidate(client, "no_resume@test.com")

    response = client.get("/resume", headers=auth_headers(token))

    assert response.status_code == 404


def test_get_resume_after_upload(client):
    token = register_candidate(client, "resume_reader@test.com")
    upload_resume(client, token, "Reader's resume text")

    response = client.get("/resume", headers=auth_headers(token))

    assert response.status_code == 200
    assert response.json()["file_path"].startswith("https://")
