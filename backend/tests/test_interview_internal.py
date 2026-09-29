import pytest

from auth.dependencies import AGENT_API_KEY
from tests.helpers import register_admin, register_candidate, create_jd, auth_headers, upload_resume


async def fake_create_interview_room(interview, current_user):
    return {"room_name": "fake-room", "token": "fake-token"}


@pytest.fixture(autouse=True)
def _mock_livekit(monkeypatch):
    monkeypatch.setattr(
        "routes.interview.create_interview_room",
        fake_create_interview_room,
    )


def agent_headers():
    return {"x-agent-key": AGENT_API_KEY}


def start_interview_with_resume(client):
    admin_token = register_admin(client, "internal_admin@test.com", "Company A")
    jd_id = create_jd(client, admin_token)
    candidate_token = register_candidate(client, "internal_candidate@test.com")
    resume_id = upload_resume(client, candidate_token, "Skilled in Python and SQL")

    response = client.post(
        "/interview/start",
        json={"resume_id": resume_id, "jd_id": jd_id},
        headers=auth_headers(candidate_token),
    )
    return response.json()["interview_id"], admin_token


def test_internal_context_rejects_wrong_agent_key(client):
    interview_id, _ = start_interview_with_resume(client)

    response = client.get(
        f"/interview/internal/context/{interview_id}",
        headers={"x-agent-key": "wrong-key"},
    )

    assert response.status_code == 401


def test_internal_context_returns_resume_and_jd(client):
    interview_id, _ = start_interview_with_resume(client)

    response = client.get(
        f"/interview/internal/context/{interview_id}",
        headers=agent_headers(),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["resume"].strip() == "Skilled in Python and SQL"
    assert body["job_description"] == "Build APIs"
    assert body["history"] == []


def test_internal_evaluation_rejects_wrong_agent_key(client):
    interview_id, _ = start_interview_with_resume(client)

    response = client.post(
        f"/interview/internal/evaluation/{interview_id}",
        json={
            "technical_knowledge": 8,
            "problem_solving": 7,
            "communication": 9,
            "relevance_to_jd": 8,
            "overall_score": 8,
            "summary": "Strong candidate",
        },
        headers={"x-agent-key": "wrong-key"},
    )

    assert response.status_code == 401


def test_internal_evaluation_then_visible_in_admin_result(client):
    interview_id, admin_token = start_interview_with_resume(client)

    submit_response = client.post(
        f"/interview/internal/evaluation/{interview_id}",
        json={
            "technical_knowledge": 8,
            "problem_solving": 7,
            "communication": 9,
            "relevance_to_jd": 8,
            "overall_score": 8,
            "summary": "Strong candidate",
        },
        headers=agent_headers(),
    )
    assert submit_response.status_code == 200

    result_response = client.get(
        f"/interview/result/{interview_id}",
        headers=auth_headers(admin_token),
    )

    assert result_response.status_code == 200
    assert result_response.json()["evaluation"]["summary"] == "Strong candidate"
    assert result_response.json()["evaluation"]["overall_score"] == 8
