from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    cli,
)

server = AgentServer()

load_dotenv()
class InterviewAgent(Agent):

    def __init__(self):
        super().__init__(
            instructions="""
            You are a friendly AI technical interviewer.

            Greet the candidate.

            Keep responses short.

            Ask only one question at a time.
            """
        ) 