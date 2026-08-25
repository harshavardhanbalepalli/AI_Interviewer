import logging
import aiohttp
import os
import json

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    TurnHandlingOptions,
    cli,
    inference,
    room_io,
)
from livekit.plugins import ai_coustics
from prompts import build_interview_prompt
logger = logging.getLogger("agent")

load_dotenv(".env.local")
async def get_interview_context(interview_id: int):

    headers = {
        "X-Agent-Key": os.getenv("AGENT_API_KEY")
    }

    async with aiohttp.ClientSession() as session:
        backend_url = os.getenv("BACKEND_URL")
        async with session.get(
            f"{backend_url}/interview/internal/context/{interview_id}",
            headers=headers,
        ) as response:

            logger.info(f"Status: {response.status}")

            response.raise_for_status()

            data = await response.json()

            if data is None:
                raise ValueError(
        f"Backend returned null for interview {interview_id}"
    )
            logger.info(
    "Interview Context:\n%s",
    json.dumps(data, indent=2)
            
)
    return data


class Assistant(Agent):
       def __init__(self, instructions: str):
        super().__init__(
            # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
            # See all available models at https://docs.livekit.io/agents/models/llm/
            llm=inference.LLM(model="openai/gpt-5.2-chat-latest"),
            # To use a realtime model instead of a voice pipeline, replace the LLM
            # with a RealtimeModel and remove the STT/TTS from the AgentSession
            # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/)
            # 1. Install livekit-agents[openai]
            # 2. Set OPENAI_API_KEY in .env.local
            # 3. Add `from livekit.plugins import openai` to the top of this file
            # 4. Replace the llm argument with:
            #     llm=openai.realtime.RealtimeModel(voice="marin")
            instructions=instructions,
        )
        


server = AgentServer()
async def on_session_end(ctx: JobContext):
    logger.info("=" * 60)
    logger.info("SESSION ENDED")
    logger.info("=" * 60)

    metadata = json.loads(ctx.room.metadata)
    interview_id = metadata["interview_id"]

    report = ctx.make_session_report()
    evaluation_ctx = report.chat_history.copy()

    evaluation_ctx.add_message(
        role="user",
        content="""
The interview has now ended.

Evaluate the candidate based only on the interview above and the provided
resume and job description.

Generate an internal hiring evaluation for the administrator.

Respond with ONLY a single valid JSON object, no markdown code fences, no
commentary before or after it, in exactly this shape:

{
  "technical_knowledge": <integer 0-100>,
  "problem_solving": <integer 0-100>,
  "communication": <integer 0-100>,
  "relevance_to_jd": <integer 0-100>,
  "overall_score": <integer 0-100, your holistic judgment>,
  "summary": "<a paragraph covering strengths, weaknesses, and your hiring recommendation>"
}

Do not address the candidate.
Be specific and base the evaluation on evidence from the interview.
"""
    )

    evaluation_llm = inference.LLM(
        model="openai/gpt-5.2-chat-latest"
    )

    logger.info(
        "Generating evaluation for interview %s",
        interview_id
    )

    stream = evaluation_llm.chat(
        chat_ctx=evaluation_ctx
    )

    raw_response = ""

    async for chunk in stream:
        if chunk.delta and chunk.delta.content:
            raw_response += chunk.delta.content

    logger.info("=" * 60)
    logger.info("EVALUATION FOR INTERVIEW %s", interview_id)
    logger.info("%s", raw_response)
    logger.info("=" * 60)

    evaluation = parse_evaluation(raw_response)

    if evaluation is None:
        logger.error(
            "Could not parse evaluation JSON for interview %s, skipping submission",
            interview_id,
        )
        return

    await submit_evaluation(interview_id, evaluation)


def parse_evaluation(raw_response: str) -> dict | None:
    text = raw_response.strip()

    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[len("json"):]
        text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.error("Failed to parse evaluation JSON: %s", raw_response)
        return None

    required_fields = (
        "technical_knowledge",
        "problem_solving",
        "communication",
        "relevance_to_jd",
        "overall_score",
        "summary",
    )

    if not all(field in data for field in required_fields):
        logger.error("Evaluation JSON missing required fields: %s", data)
        return None

    return data


async def submit_evaluation(interview_id: int, evaluation: dict):
    headers = {
        "X-Agent-Key": os.getenv("AGENT_API_KEY")
    }

    async with aiohttp.ClientSession() as session:
        backend_url = os.getenv("BACKEND_URL")
        async with session.post(
            f"{backend_url}/interview/internal/evaluation/{interview_id}",
            headers=headers,
            json=evaluation,
        ) as response:
            if response.status != 200:
                logger.error(
                    "Failed to submit evaluation for interview %s: %s %s",
                    interview_id,
                    response.status,
                    await response.text(),
                )
            else:
                logger.info(
                    "Evaluation submitted successfully for interview %s",
                    interview_id,
                )

@server.rtc_session(agent_name="livekit-learning", on_session_end=on_session_end,)


async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }
    await ctx.connect()

    logger.info("Metadata: %r", ctx.room.metadata)

    if ctx.room.metadata:
        metadata = json.loads(ctx.room.metadata)
        interview_id = metadata["interview_id"]
    else:
        interview_id = int(ctx.room.name.split("-")[1])

    interview_context = await get_interview_context(interview_id)
    resume = interview_context.get("resume", "")
    job_description = interview_context.get("job_description", "")
    history = interview_context.get("history", [])
    prompt=build_interview_prompt(resume, job_description, history)
    logger.info(
    "Prompt generated (%d characters)",
    len(prompt),
)
    logger.info("Interview Context:")
    #instead of logging the whole resume, history and jd we are goind to log the summay and lengths of them 
    # logger.info("=" * 60)
    # logger.info("Interview ID: %s", interview_id)
    # logger.info("Resume: %d chars", len(resume))
    # logger.info("Job Description: %d chars", len(job_description))
    # logger.info("History Messages: %d", len(history))
    # logger.info("=" * 60)
    # logger.info("Room Name: %s", ctx.room.name)
    # logger.info("Room Metadata: %s", ctx.room.metadata)
    # logger.info("Remote Participants: %s", ctx.room.remote_participants)
    # Set up a voice AI pipeline using OpenAI, Cartesia, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=inference.STT(model="deepgram/nova-3", language="multi"),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=inference.TTS(
            model="cartesia/sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"
        ),
        # The LiveKit turn detector determines when the user is done speaking and the agent should respond.
        # TurnDetector is an end-of-turn model that listens to the user's audio directly, combining
        # semantic understanding with acoustic cues (intonation, pitch, rhythm) for state-of-the-art accuracy.
        # AgentSession supplies the required VAD automatically.
        # See more at https://docs.livekit.io/agents/build/turns
        turn_handling=TurnHandlingOptions(
            turn_detection=inference.TurnDetector(),
        ),
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(prompt),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=ai_coustics.audio_enhancement(
                    model=ai_coustics.EnhancerModel.QUAIL_VF_S
                ),
            ),
        ),
    )
    await session.generate_reply(
    instructions="""
Start the interview immediately.
Introduce yourself briefly and ask the candidate to introduce themselves.
"""
)
    logger.info("Agent session started successfully")
    logger.info(dir(session))
    logger.info(
    "Participants after start: %s",
    ctx.room.remote_participants,
)
    logger.info("History type: %s", type(session.history))
    logger.info("History: %s", session.history)
    logger.info("History attributes: %s", dir(session.history))

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = anam.AvatarSession(
    #     persona_config=anam.PersonaConfig(
    #         name="...",
    #         avatarId="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/anam
    #     ),
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Join the room and connect to the user
 


if __name__ == "__main__":
    cli.run_app(server)
