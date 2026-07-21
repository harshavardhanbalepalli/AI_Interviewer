import os

from dotenv import load_dotenv
from livekit import api
import json
from livekit.protocol.room import CreateRoomRequest
from livekit.protocol.agent_dispatch import CreateAgentDispatchRequest
load_dotenv()
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

async def create_interview_room(interview, current_user):
    
     room_name = f"interview-{interview.id}"

     metadata = json.dumps({
    "interview_id": interview.id,
})
    

     request = CreateRoomRequest(
    name=room_name,
    metadata=metadata,
)
     async with api.LiveKitAPI() as lkapi:
      await lkapi.room.create_room(request)

      await lkapi.agent_dispatch.create_dispatch(
    CreateAgentDispatchRequest(
        agent_name="livekit-learning",
        room=room_name,
    )
)
     
    # to check for the list of rooms available in the livekit cloud
    #   rooms = await lkapi.room.list_rooms(
    #     ListRoomsRequest()
    #     )

    #   for room in rooms.rooms:
    #    print(room.name)
    #  identity = str(current_user["user_id"])
     print("CURRENT USER:", current_user)
     identity = str(current_user["user_id"])
     print("IDENTITY:", identity)
     token = (
        api.AccessToken(
            LIVEKIT_API_KEY,
            LIVEKIT_API_SECRET,
        )
        .with_identity(identity)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
            )
        )
    )

     return {
        "room_name": room_name,
        "token": token.to_jwt(),
    }