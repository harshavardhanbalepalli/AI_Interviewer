import pytest

from tests.helpers import register_admin, register_candidate, create_jd, auth_headers


async def fake_create_interview_room(interview, current_user):
    return {"room_name": "fake-room", "token": "fake-token"}


@pytest.fixture(autouse=True)
def _mock_livekit(monkeypatch):
    monkeypatch.setattr(
        "routes.interview.create_interview_room",
        fake_create_interview_room,
    )


def start_interview(client, candidate_token, jd_id, resume_id=1):
    return client.post(
        "/interview/start",
        json={"resume_id": resume_id, "jd_id": jd_id},
        headers=auth_headers(candidate_token),
    )


def finish_interview(client, token, interview_id, transcript=None):
    return client.post(
        f"/interview/finish/{interview_id}",
        json={"transcript": transcript or []},
        headers=auth_headers(token),
    )


def test_start_interview_success(client):
    admin_token = register_admin(client, "admin@test.com", "Company A")
    jd_id = create_jd(client, admin_token)
    candidate_token = register_candidate(client, "candidate@test.com")

    response = start_interview(client, candidate_token, jd_id)

    assert response.status_code == 200
    body = response.json()
    assert body["room_name"] == "fake-room"
    assert body["livekit_token"] == "fake-token"
    assert "interview_id" in body


def test_start_interview_jd_not_found(client):
    candidate_token = register_candidate(client, "candidate2@test.com")

    response = start_interview(client, candidate_token, jd_id=99999)

    assert response.status_code == 404


def test_start_interview_conflict_when_already_active(client):
    admin_token = register_admin(client, "admin2@test.com", "Company A")
    jd_id = create_jd(client, admin_token)
    candidate_token = register_candidate(client, "candidate3@test.com")

    first = start_interview(client, candidate_token, jd_id)
    assert first.status_code == 200

    second = start_interview(client, candidate_token, jd_id)

    assert second.status_code == 409
    assert "in progress" in second.json()["detail"]


def test_start_interview_conflict_when_already_completed(client):
    admin_token = register_admin(client, "admin3@test.com", "Company A")
    jd_id = create_jd(client, admin_token)
    candidate_token = register_candidate(client, "candidate4@test.com")

    started = start_interview(client, candidate_token, jd_id)
    interview_id = started.json()["interview_id"]

    finish_response = finish_interview(client, candidate_token, interview_id)
    assert finish_response.status_code == 200

    second = start_interview(client, candidate_token, jd_id)

    assert second.status_code == 409
    assert "already completed" in second.json()["detail"]


def test_finish_interview_rejects_non_owner(client):
    admin_token = register_admin(client, "admin4@test.com", "Company A")
    jd_id = create_jd(client, admin_token)
    owner_token = register_candidate(client, "owner_candidate@test.com")
    intruder_token = register_candidate(client, "intruder_candidate@test.com")

    started = start_interview(client, owner_token, jd_id)
    interview_id = started.json()["interview_id"]

    response = finish_interview(client, intruder_token, interview_id)

    assert response.status_code == 404


def test_list_my_interviews_reflects_status(client):
    admin_token = register_admin(client, "admin5@test.com", "Company A")
    jd_id = create_jd(client, admin_token)
    candidate_token = register_candidate(client, "candidate5@test.com")

    started = start_interview(client, candidate_token, jd_id)
    interview_id = started.json()["interview_id"]

    before_finish = client.get("/interview/my-interviews", headers=auth_headers(candidate_token))
    assert before_finish.json() == [{"jd_id": jd_id, "status": "active"}]

    finish_interview(client, candidate_token, interview_id)

    after_finish = client.get("/interview/my-interviews", headers=auth_headers(candidate_token))
    assert after_finish.json() == [{"jd_id": jd_id, "status": "completed"}]


def test_list_results_scoped_to_company(client):
    admin_a = register_admin(client, "admin_a3@test.com", "Company A")
    admin_b = register_admin(client, "admin_b3@test.com", "Company B")
    jd_a = create_jd(client, admin_a, title="Job At A")
    candidate = register_candidate(client, "candidate6@test.com")
    start_interview(client, candidate, jd_a)

    results_for_a = client.get("/interview/results", headers=auth_headers(admin_a))
    results_for_b = client.get("/interview/results", headers=auth_headers(admin_b))

    assert len(results_for_a.json()) == 1
    assert results_for_a.json()[0]["candidate_email"] == "candidate6@test.com"
    assert results_for_b.json() == []


def test_get_result_forbidden_for_other_company(client):
    admin_a = register_admin(client, "admin_a4@test.com", "Company A")
    admin_b = register_admin(client, "admin_b4@test.com", "Company B")
    jd_a = create_jd(client, admin_a)
    candidate = register_candidate(client, "candidate7@test.com")
    started = start_interview(client, candidate, jd_a)
    interview_id = started.json()["interview_id"]

    response = client.get(f"/interview/result/{interview_id}", headers=auth_headers(admin_b))

    assert response.status_code == 403


def test_get_result_not_found(client):
    admin_token = register_admin(client, "admin6@test.com", "Company A")

    response = client.get("/interview/result/99999", headers=auth_headers(admin_token))

    assert response.status_code == 404
