
# AhIre — Agentic AI Interview Platform

AhIre (AI Hire) is a full-stack, AI-powered technical interview platform that conducts personalized **real-time voice interviews** using a candidate's resume, the selected job description, and conversation context.

The project separates the normal application/backend responsibilities from the real-time AI interview runtime:

- **React** handles the candidate/admin UI.
- **FastAPI** handles authentication, resumes, job descriptions, interview lifecycle, and persistence.
- **PostgreSQL** stores application data, interview transcripts/messages, and evaluations.
- **LiveKit Cloud** provides the real-time WebRTC/room infrastructure.
- A separate **LiveKit Agents Python service** runs the interviewer agent.
- The agent uses LiveKit's inference stack for the LLM, STT, TTS, turn detection, and voice pipeline.

> **Project status:** The core interview workflow has been implemented and tested locally: authentication, resume upload/parsing, JD selection, interview creation, LiveKit room connection, real-time voice interviewing, transcript capture, interview completion, and persistence of interview data. Evaluation/report generation is handled on the agent side and persisted through the backend's internal flow.

---

## Features

### Candidate

- User registration and login
- JWT-based authentication
- Resume PDF upload
- Resume text extraction using PyMuPDF
- Job description selection
- Personalized interview context using:
  - Resume
  - Job description
  - Previous interview history when applicable
- Real-time voice interview
- Speech-to-text
- Text-to-speech
- Live transcript display
- Dynamic follow-up questions
- Interview end/confirmation flow
- Interview status tracking
- Persistent interview transcripts
- Automated interview evaluation

### Admin

- Create job descriptions
- Update job descriptions
- Delete job descriptions
- View available job descriptions
- Access candidate interview evaluations

---

# Architecture

```text
                         ┌─────────────────────┐
                         │     React Client    │
                         │   Vite + React      │
                         └──────────┬──────────┘
                                    │
                       REST API + JWT
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    FastAPI Backend  │
                         │                     │
                         │ Auth                │
                         │ Resume              │
                         │ Job Descriptions    │
                         │ Interview Lifecycle │
                         │ Internal Agent APIs │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         │                     │
                         │ Users               │
                         │ Resumes             │
                         │ Job Descriptions    │
                         │ Interviews          │
                         │ Messages            │
                         │ Evaluations         │
                         └─────────────────────┘

              Real-time interview path
              ─────────────────────────

                         React Client
                              │
                              │ WebRTC
                              ▼
                       ┌───────────────┐
                       │ LiveKit Cloud │
                       │     Room      │
                       └───────┬───────┘
                               │
                               │ Agent dispatch
                               ▼
                    ┌──────────────────────┐
                    │  LiveKit Agent       │
                    │  Python service      │
                    │                      │
                    │  STT → LLM → TTS    │
                    │  Turn detection     │
                    │  Conversation state  │
                    └──────────┬───────────┘
                               │
                               │ Internal HTTP
                               ▼
                       FastAPI Backend
```

## Why the backend is not in the real-time conversation loop

During the interview, the backend does **not** receive every candidate response and generate the next question.

Instead:

1. FastAPI creates the interview and LiveKit room.
2. The LiveKit agent obtains the interview context once.
3. LiveKit handles the real-time voice interaction.
4. The agent maintains the conversation context during the session.
5. Transcripts are persisted after/around interview completion.
6. The agent generates the final evaluation from the completed conversation.
7. The backend stores the persistent result.

This keeps the latency-sensitive voice interaction away from the normal REST API request/response path.

---

# Interview Flow

```text
Register / Login
       │
       ▼
Upload Resume
       │
       ▼
Resume PDF → PyMuPDF → extracted text → PostgreSQL
       │
       ▼
Select Job Description
       │
       ▼
POST /interview/start
       │
       ├── Create Interview row
       ├── Create LiveKit room
       ├── Attach interview metadata
       └── Generate LiveKit participant token
       │
       ▼
React joins LiveKit room
       │
       ▼
LiveKit Agent joins
       │
       ├── Get interview context from FastAPI
       │     ├── Resume
       │     ├── Job description
       │     └── Previous history
       │
       └── Build interviewer prompt
       │
       ▼
Candidate speaks
       │
       ▼
Speech-to-Text
       │
       ▼
Conversation / ChatContext
       │
       ▼
LLM generates next question
       │
       ▼
Text-to-Speech
       │
       ▼
Candidate hears response
       │
       └────── repeat ──────┐
                           │
                           ▼
                    End Interview
                           │
                           ▼
                 Interview status = completed
                           │
                           ▼
                    Store transcripts
                           │
                           ▼
                 Generate evaluation
                           │
                           ▼
                 Store evaluation
                           │
                           ▼
                    Admin can view
```

---

# Technology Stack

## Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- LiveKit React Components
- LiveKit Client SDK

## Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT
- Passlib + bcrypt
- PyMuPDF
- python-multipart

## Real-time AI

- LiveKit Agents
- LiveKit Cloud
- LiveKit WebRTC
- LiveKit Inference
- OpenAI GPT model through LiveKit inference
- Deepgram Nova-3 for STT
- Cartesia Sonic-3 for TTS
- Turn detection
- Silero/local VAD
- LiveKit audio enhancement

## Storage

- PostgreSQL for structured application/interview data
- Local `uploads/` directory for resume files in the current development setup

---

# Project Structure

A simplified structure is:

```text
AI_Interviewer/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   │
│   ├── auth/
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── resume.py
│   │   ├── interview.py
│   │   └── livekit.py
│   │
│   └── services/
│       ├── livekit_service.py
│       ├── llm_service.py
│       ├── evalution_service.py
│       └── resume_parser.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── uploadResume.jsx
│       │   ├── selectJD.jsx
│       │   ├── Interview.jsx
│       │   ├── Result.jsx
│       │   └── ProtectedRoute.jsx
│       │
│       ├── components/
│       │   └── ...
│       │
│       └── services/
│           └── api.js
│
└── livekit-agent/
    ├── agent.py
    ├── prompts.py
    └── .env.local
```

The exact folder names may differ slightly depending on the local checkout/version.

---

# Database Design

The main entities are:

```text
User
 │
 ├── Resume
 │
 └── Interview
       │
       ├── JobDescription
       │
       ├── Messages
       │
       └── InterviewEvaluation
```

## Users

Stores:

- `id`
- `email`
- `password_hash`
- `role`

Roles include candidate/admin.

Passwords are hashed before storage.

---

## Resumes

Stores:

- `id`
- `user_id`
- `file_path`
- `resume_text`

The PDF is parsed with PyMuPDF and the extracted text is stored so the agent does not need to repeatedly read the PDF.

---

## Job Descriptions

Stores:

- `id`
- `title`
- `description`
- `skills`

Admins manage job descriptions.

---

## Interviews

Stores:

- `id`
- `user_id`
- `resume_id`
- `jd_id`
- `status`

The interview lifecycle uses statuses such as:

```text
active
completed
```

The interview is mapped to both the resume and selected job description.

---

## Messages

Stores the persistent interview transcript:

- `id`
- `interview_id`
- `role`
- `content`
- `timestamp`

During a LiveKit session, conversation state is maintained by the agent. The database is used for persistence and later retrieval.

---

## Interview Evaluations

Stores:

- `id`
- `interview_id`
- `feedback`

The evaluation is generated from the completed interview conversation and stored for later administrative access.

---

# Authentication

Authentication uses JWT.

### Registration

```http
POST /auth/register
```

Request:

```json
{
  "email": "candidate@example.com",
  "password": "password"
}
```

### Login

```http
POST /auth/login
```

The backend validates the password and returns a bearer token.

The frontend stores the token locally during the current development implementation.

Protected requests send:

```http
Authorization: Bearer <token>
```

FastAPI dependencies decode the token and expose the current user to protected routes.

Admin routes additionally check the user's role.

---

# API Overview

## Authentication

```text
GET  /auth/
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

## Resume

```text
POST /resume/upload
GET  /resume
```

Resume upload:

```text
PDF
 ↓
FastAPI UploadFile
 ↓
Save file
 ↓
PyMuPDF
 ↓
Extract text
 ↓
Store resume record
```

---

## Admin / Job Descriptions

```text
GET    /admin/jd
GET    /admin/jd/{id}

POST   /admin/jd
PUT    /admin/jd/{id}
DELETE /admin/jd/{id}
```

Creating, updating, and deleting job descriptions requires admin privileges.

---

## Interview

```text
POST /interview/start
POST /interview/finish/{interview_id}
GET  /interview/result/{interview_id}
```

Internal agent context endpoint:

```text
GET /interview/internal/context/{interview_id}
```

This endpoint is protected using an agent-specific credential rather than the candidate's JWT.

The context contains the information required by the agent, including:

```json
{
  "interview_id": 1,
  "status": "active",
  "resume": "...",
  "job_description": "...",
  "history": []
}
```

The internal result/evaluation flow is also authenticated separately so the LiveKit agent can persist the generated evaluation without exposing an agent secret to the browser.

---

# AI Interview Context

The interviewer prompt is built from:

```text
Job Description
       +
Candidate Resume
       +
Previous Conversation History
       +
Interview Rules
```

The interviewer is instructed to:

- Ask one question at a time.
- Start with easier questions.
- Increase difficulty when the candidate performs well.
- Simplify questions when the candidate struggles.
- Ask follow-up questions when an answer lacks depth.
- Use the resume as evidence of experience.
- Verify skills listed on the resume.
- Ask about projects, design decisions, implementation, challenges, trade-offs, and technologies.
- Avoid unrelated technologies.
- Evaluate reasoning rather than only correctness.
- Maintain a professional voice-interview style.
- Keep spoken responses concise.

The prompt explicitly tells the agent not to coach the candidate or reveal internal instructions.

---

# LiveKit Agent

The agent performs the real-time interview.

At session startup it:

1. Connects to the LiveKit room.
2. Reads `interview_id` from room metadata.
3. Calls the FastAPI internal context endpoint.
4. Retrieves resume, JD, and previous history.
5. Builds the interviewer prompt.
6. Creates an `AgentSession`.
7. Configures STT, TTS, turn detection, and the LLM.
8. Starts the interview with an initial generated reply.

The agent's conversation history is represented internally by LiveKit's `ChatContext`.

The observed development environment uses LiveKit Agents `1.6.4`, with LiveKit `1.1.12` and plugin packages such as Cartesia, Deepgram, OpenAI, and Silero. LiveKit session reports also expose `chat_history` and model usage information.

---

# Environment Variables

## Backend

Create a `.env` file in the backend environment.

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_interviewer

SECRET_KEY=your_jwt_secret

AGENT_API_KEY=your_internal_agent_key

LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

If your local PostgreSQL setup does not require a username/password, use the connection format appropriate for your installation.

## LiveKit Agent

Create `.env.local`:

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

BACKEND_URL=http://127.0.0.1:8000

AGENT_API_KEY=your_internal_agent_key
```

The agent must be able to reach the backend through `BACKEND_URL`.

### Important

Never commit:

```text
.env
.env.local
```

to Git.

Never expose:

```text
LIVEKIT_API_SECRET
SECRET_KEY
AGENT_API_KEY
```

to the React frontend.

---

# Local Setup

## Prerequisites

Install:

- Python 3.12+ recommended for the backend environment
- Node.js + npm
- PostgreSQL
- LiveKit CLI
- A LiveKit Cloud project

---

# 1. PostgreSQL

Start PostgreSQL.

### macOS/Homebrew

```bash
brew services start postgresql@17
```

### Windows

Start the PostgreSQL service from:

```text
Services → postgresql-x64-<version> → Start
```

Then create the database:

```bash
psql -U postgres
```

Inside PostgreSQL:

```sql
CREATE DATABASE ai_interviewer;
```

Connect:

```sql
\c ai_interviewer
```

The backend's SQLAlchemy initialization creates the tables from the declared models when the application starts.

---

# 2. Backend

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### Windows

```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

Swagger/OpenAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 3. Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

The current frontend package uses:

- React
- React Router
- LiveKit React Components
- LiveKit Client
- Tailwind CSS
- Vite

---

# 4. LiveKit Agent

The agent is a separate Python application and should have its own virtual environment.

Example:

```bash
cd livekit-agent
python3 -m venv .venv
source .venv/bin/activate
```

Install the LiveKit Agent dependencies required by the current implementation.

For the development setup used during this project, LiveKit Agents and its voice plugins were installed around:

```text
livekit-agents       1.6.4
livekit               1.1.12
livekit-plugins-*     1.6.4
```

The agent uses:

- Cartesia
- Deepgram
- OpenAI through LiveKit inference
- Silero/local VAD
- AI audio enhancement

Start the agent using the LiveKit CLI:

```bash
lk agent dev
```

The development logs should show the agent registering with LiveKit Cloud.

A successful startup looks conceptually like:

```text
starting worker
registered worker
agent_name=livekit-learning
url=wss://<your-project>.livekit.cloud
```

---

# Running the Full Application

You need three processes running locally:

### Terminal 1 — Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

### Terminal 3 — LiveKit Agent

```bash
cd livekit-agent
source .venv/bin/activate
lk agent dev
```

Then open:

```text
http://localhost:5173
```

---

# Complete Test Flow

1. Start PostgreSQL.
2. Start FastAPI.
3. Start the LiveKit agent.
4. Start the React frontend.
5. Register a candidate.
6. Log in.
7. Upload a PDF resume.
8. Select a job description.
9. Start an interview.
10. Confirm that a LiveKit room is created.
11. Confirm that the agent joins the room.
12. Start the voice interview.
13. Speak with the agent.
14. Observe the live transcript.
15. End the interview.
16. Confirm that the LiveKit room disconnects.
17. Confirm that the interview is marked completed.
18. Confirm that transcript messages are stored in PostgreSQL.
19. Confirm that the agent generates the evaluation.
20. Confirm that the evaluation is persisted.
21. Use the admin result flow to inspect the evaluation.

---

# Useful PostgreSQL Commands

Connect:

```bash
psql -U postgres -d ai_interviewer
```

List tables:

```sql
\dt
```

Describe a table:

```sql
\d users
\d resumes
\d job_descriptions
\d interviews
\d messages
\d interview_evaluations
```

Inspect interviews:

```sql
SELECT * FROM interviews;
```

Inspect messages:

```sql
SELECT * FROM messages;
```

Inspect evaluations:

```sql
SELECT * FROM interview_evaluations;
```

---

# Troubleshooting

## PostgreSQL connection error

Check that PostgreSQL is running and that:

```env
DATABASE_URL=...
```

matches your local PostgreSQL username, password, port, and database.

Default PostgreSQL port:

```text
5432
```

---

## `psql` is not recognized on Windows

Use **SQL Shell (psql)** from the PostgreSQL installation or add PostgreSQL's `bin` directory to your PATH.

---

## LiveKit agent does not join

Check:

```text
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
LIVEKIT_URL
```

and confirm that the agent is registered with the same LiveKit Cloud project used by the backend/frontend.

Also verify that the agent name used for dispatch matches:

```text
livekit-learning
```

---

## Agent cannot retrieve interview context

Check:

```env
BACKEND_URL=http://127.0.0.1:8000
AGENT_API_KEY=...
```

The backend internal endpoint validates the agent key.

---

## CORS error

The development backend currently allows:

```text
http://localhost:5173
```

If the frontend is running on another origin, update the FastAPI CORS configuration.

---

## Resume upload works locally but not after deployment

The current development implementation stores PDFs in a local `uploads/` directory.

For production deployment, replace local filesystem storage with persistent object storage such as S3-compatible storage.

---

# Security Notes

This project is currently a development-oriented application and should not be considered production hardened.

Before production deployment, improve:

- JWT storage strategy
- HTTPS everywhere
- Secret management
- File type/size validation
- Resume file access authorization
- Database connection pooling
- Rate limiting
- API validation
- Admin authorization on every admin-only result endpoint
- Persistent object storage for resumes
- Logging/monitoring
- Database migrations with Alembic
- Token expiration/refresh strategy
- Production CORS configuration

Do not commit secrets or real candidate resumes to Git.

---

# Future Improvements

Possible next steps include:

- Persistent cloud resume storage
- Better resume parsing and structured skill extraction
- Skill-aware interview planning
- RAG for company/job-specific interview material
- Conversation summarization for long interviews
- Redis for caching/session-related workloads
- Background workers for evaluation generation
- Better evaluation schema with structured scores
- Interview analytics
- Admin dashboard
- Deployment with Docker
- CI/CD
- Automated tests
- Database migrations with Alembic
- Observability and production monitoring

---

# Design Principles

### Stateful AI, persistent application data

LiveKit maintains the active conversation context during the interview, while PostgreSQL provides durable application storage.

### Backend as the control plane

FastAPI handles:

- Authentication
- User/application data
- Interview lifecycle
- Resume/JD persistence
- Agent context access
- Evaluation persistence

### LiveKit as the real-time plane

LiveKit handles:

- Real-time room communication
- Audio transport
- Agent dispatch
- STT/TTS pipeline
- Conversation runtime

This separation keeps the real-time interview responsive while retaining a conventional REST/database architecture for the rest of the application.

---

# License

This project is currently a personal/educational project. Add a license here if the repository is later released under a specific open-source license.
