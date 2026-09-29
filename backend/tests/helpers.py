import fitz


def register_admin(client, email, company_name):
    response = client.post("/auth/register", json={
        "email": email,
        "password": "testpass123",
        "role": "admin",
        "company_name": company_name,
    })
    return response.json()["access_token"]


def register_candidate(client, email):
    response = client.post("/auth/register", json={
        "email": email,
        "password": "testpass123",
        "role": "candidate",
    })
    return response.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def create_jd(client, admin_token, title="Backend Engineer"):
    response = client.post(
        "/admin/jd",
        json={
            "title": title,
            "description": "Build APIs",
            "skills": "Python",
        },
        headers=auth_headers(admin_token),
    )
    return response.json()["job"]["id"]


def make_pdf_bytes(text="Experienced Python developer"):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    return doc.tobytes()


def upload_resume(client, token, text="Experienced Python developer"):
    response = client.post(
        "/resume/upload",
        files={"file": ("resume.pdf", make_pdf_bytes(text), "application/pdf")},
        headers=auth_headers(token),
    )
    return response.json()["resume_id"]
