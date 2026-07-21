import { useTracks, StartAudio } from "@livekit/components-react";
import { Track } from "livekit-client";

import InterviewHeader from "./InterviewHeader";
import AIOrb from "./AIOrb";

function InterviewContent({
  elapsedTime,
  connectionStatus,
  finishInterview,
}) {
  const tracks = useTracks([
    {
      source: Track.Source.Microphone,
      withPlaceholder: false,
    },
  ]);

  const aiTrackRef = tracks.find((track) => track.participant.isAgent);

  const agentState =
    aiTrackRef?.participant?.attributes?.["lk.agent.state"];

  const status =
  {
    speaking: "Speaking",
    listening: "Listening",
    thinking: "Thinking",
  }[agentState] || "Connecting";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        <InterviewHeader
          elapsedTime={elapsedTime}
          connectionStatus={connectionStatus}
        />

        <div className="mt-6 rounded-3xl bg-white p-10 shadow-xl">
          <AIOrb status={status} />

          <div className="mt-12 rounded-2xl border bg-slate-50 p-8">
            <p className="mb-3 text-sm uppercase tracking-widest text-slate-500">
              Current Question
            </p>

            <h3 className="text-2xl font-semibold leading-10 text-slate-900">
              Tell me about yourself and explain one challenging project you've
              worked on.
            </h3>
          </div>

          <div className="mt-10 flex justify-center gap-6">
            <StartAudio label="🎤 Start Interview" />

            <button
              onClick={finishInterview}
              className="rounded-xl bg-red-500 px-8 py-3 font-semibold text-white transition hover:bg-red-600"
            >
              Finish Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewContent;