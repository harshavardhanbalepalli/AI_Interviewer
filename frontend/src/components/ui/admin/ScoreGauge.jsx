function band(value) {
  if (value >= 70) {
    return {
      stroke: "stroke-green-500",
      badge: "bg-green-100 text-green-700",
      text: "Strong",
    };
  }

  if (value >= 40) {
    return {
      stroke: "stroke-orange-500",
      badge: "bg-orange-100 text-orange-700",
      text: "Developing",
    };
  }

  return {
    stroke: "stroke-red-500",
    badge: "bg-red-100 text-red-700",
    text: "Needs Improvement",
  };
}

function ScoreGauge({ label, value, size = "default" }) {
  const radius = 80;
  const arcLength = Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const offset = arcLength * (1 - clamped / 100);
  const { stroke, badge, text } = band(clamped);

  const numberClass =
    size === "large" ? "text-5xl" : "text-3xl";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          className="stroke-slate-200"
          strokeWidth="14"
          strokeLinecap="round"
        />

        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          className={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={offset}
        />

        <text
          x="100"
          y="92"
          textAnchor="middle"
          className={`${numberClass} font-bold fill-slate-900`}
        >
          {clamped}
        </text>
      </svg>

      <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">
        {label}
      </p>

      <span
        className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${badge}`}
      >
        {text}
      </span>
    </div>
  );
}

export default ScoreGauge;
