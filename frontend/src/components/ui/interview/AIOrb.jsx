

function AIOrb({ status }) {

  const color =
    status === "Speaking"
      ? "from-orange-400 to-orange-600"
      : status === "Listening"
      ? "from-blue-400 to-blue-600"
      : "from-purple-400 to-purple-600";

  return (
    <div className="flex flex-col items-center">

      <div className="relative h-56 w-56 flex items-center justify-center">

        <div
          className={`absolute h-56 w-56 rounded-full bg-gradient-to-r ${color} opacity-20 blur-3xl animate-pulse`}
        />

        <div
          className={`absolute h-44 w-44 rounded-full bg-gradient-to-r ${color} opacity-40 blur-xl animate-pulse`}
        />

        <div
          className={`relative h-32 w-32 rounded-full bg-gradient-to-br ${color} shadow-2xl`}
        />

      </div>

      <h2 className="mt-8 text-3xl font-bold text-slate-900">
        AI Interviewer
      </h2>


      <p className="mt-4 text-lg font-semibold text-slate-600">
        {status}
      </p>

    </div>
  );
}

export default AIOrb;