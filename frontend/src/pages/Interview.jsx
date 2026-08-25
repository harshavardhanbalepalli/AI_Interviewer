import { useNavigate } from "react-router-dom";
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

import InterviewContent from "../components/ui/interview/InterviewContent";

function Interview() {
  const token = localStorage.getItem("livekit_token");
  const navigate = useNavigate();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [connectionStatus] = useState("Preparing AI");

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

 const finishInterview = async (room, transcript) => {
  
  try {
    const interviewId = localStorage.getItem("interview_id");
    const jwt = localStorage.getItem("token");
    
    const response = await fetch(
    `http://127.0.0.1:8000/interview/finish/${interviewId}`,
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            transcript,
        }),
    }
);

    if (!response.ok) {
      throw new Error("Failed to finish interview");
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (room) {
      await room.disconnect();
    }

    localStorage.removeItem("interview_id");
    localStorage.removeItem("livekit_token");
    localStorage.removeItem("room_name");

    navigate("/jds");
  }
};

  return (
    <LiveKitRoom
      serverUrl="wss://ai-interviewer-u1y35hf3.livekit.cloud"
      token={token}
      connect={true}
      audio={true}
      video={false}
      style={{ height: "100vh" }}
    >
      <RoomAudioRenderer />

      <InterviewContent
        elapsedTime={elapsedTime}
        connectionStatus={connectionStatus}
        finishInterview={finishInterview}
      />
    </LiveKitRoom>
  );
}

export default Interview;