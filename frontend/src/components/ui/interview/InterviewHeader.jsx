import { Badge } from "@/components/ui/badge";

function InterviewHeader({ elapsedTime, connectionStatus }) {
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return (
    <header className="bg-white rounded-2xl border shadow-sm px-8 py-6 flex items-center justify-between">

      {/* Logo */}

      <div>
        <h1 className="text-3xl font-black text-slate-900">
          <span className="text-orange-500">A</span>h
          <span className="text-orange-500">I</span>re Interview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          AI Powered Screening Interview
        </p>
      </div>

      {/* Timer */}

      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-slate-400">
          Duration
        </p>

        <p className="text-4xl font-bold tabular-nums text-slate-900">
          {formattedTime}
        </p>
      </div>

      {/* Status */}

      <Badge
        className={`px-5 py-2 text-sm rounded-full ${
          connectionStatus === "Interview Live"
            ? "bg-green-100 text-green-700 hover:bg-green-100"
            : connectionStatus === "Preparing AI"
            ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
            : "bg-red-100 text-red-700 hover:bg-red-100"
        }`}
      >
        <span className="mr-2 h-2 w-2 rounded-full bg-current inline-block animate-pulse"></span>

        {connectionStatus}
      </Badge>

    </header>
  );
}

export default InterviewHeader;