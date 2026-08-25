import { mergeTranscriptions } from "@/lib/utils";

function Transcript({ messages }) {
  const merged = mergeTranscriptions(messages);

  return (
    <div className="mt-8 space-y-4 max-h-96 overflow-y-auto">
      {merged.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.isAgent ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-[75%] rounded-xl px-4 py-3 ${
              msg.isAgent
                ? "bg-slate-100 text-slate-900"
                : "bg-orange-500 text-white"
            }`}
          >
            <p className="mb-1 text-xs font-semibold">
              {msg.isAgent ? "Interviewer" : "You"}
            </p>

            <p>{msg.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Transcript;
