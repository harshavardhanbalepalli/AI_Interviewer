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

  const finishInterview = () => {
    navigate("/");
  };
const [elapsedTime, setElapsedTime] = useState(0);
const [connectionStatus, setConnectionStatus] = useState("Preparing AI");
useEffect(() => {
  const timer = setInterval(() => {
    setElapsedTime((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
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