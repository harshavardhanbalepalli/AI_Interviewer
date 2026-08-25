import {
  useTracks,
  StartAudio,
  useTranscriptions,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useState } from "react";

import InterviewHeader from "./InterviewHeader";
import AIOrb from "./AIOrb";
import Transcript from "./Transcipt";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { mergeTranscriptions } from "@/lib/utils";

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

  const transcriptions = useTranscriptions();
console.log(transcriptions);

  const room = useRoomContext();

  const [showEndDialog, setShowEndDialog] = useState(false);
  const [endingInterview, setEndingInterview] = useState(false);

  const aiTrackRef = tracks.find(
    (track) => track.participant.isAgent
  );

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
            <p className="mb-4 text-sm uppercase tracking-widest text-slate-500">
              Live Transcript
            </p>

            <Transcript messages={transcriptions} />
          </div>

          <div className="mt-10 flex justify-center gap-6">
            <StartAudio label="🎤 Start Interview" />

            <button
              onClick={() => setShowEndDialog(true)}
              className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>End Interview?</DialogTitle>

      <DialogDescription>
        This interview will be submitted and you won't be able to rejoin this
        session.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowEndDialog(false)}
      >
        Cancel
      </Button>

      <Button
        variant="destructive"
        disabled={endingInterview}
        onClick={async () => {
          
          setEndingInterview(true);
          const transcript = mergeTranscriptions(transcriptions).map((msg) => ({
    speaker: msg.isAgent ? "agent" : "candidate",
    text: msg.text,
    timestamp: msg.timestamp,
}));
          await finishInterview(room, transcript);
          setEndingInterview(false);
        }}
      >
        {endingInterview ? "Ending..." : "End Interview"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}

export default InterviewContent;