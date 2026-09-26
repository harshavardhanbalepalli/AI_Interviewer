import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Design tokens pulled from the "Modernist" design-system project this page was imported from.
const colors = {
  bg: "#f3f2f2",
  surface: "#eae9e9",
  text: "#201e1d",
  accent: "#ec3013",
  accent700: "#ae1800",
};

const REVEAL_EASE = [0.22, 0.61, 0.24, 1];

function Reveal({ children, delay = 0, scale = false, className = "", style, ...props }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: scale ? 0 : 22, scale: scale ? 1.035 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -12% 0px" }}
      transition={{ duration: scale ? 1.1 : 0.9, delay: delay / 1000, ease: REVEAL_EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function ImagePlaceholder({ label, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border-2 grayscale contrast-125 ${className}`}
      style={{ borderColor: `${colors.text}66`, background: colors.surface }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
        <span className="text-sm" style={{ color: `${colors.text}80` }}>
          {label}
        </span>
      </div>
    </div>
  );
}

const stack = [
  { label: "Interview runtime", value: "LiveKit Cloud + Agents" },
  { label: "Control plane", value: "FastAPI + PostgreSQL" },
  { label: "Client", value: "React 19 + Vite" },
  { label: "Voice pipeline", value: "Deepgram · GPT · Cartesia" },
];

const capabilities = [
  {
    index: "01",
    kicker: "Resume intake",
    title: "A PDF becomes text once, then never again.",
    body: (
      <>
        The candidate uploads a resume to{" "}
        <code
          className="rounded px-1 py-0.5 text-[15px]"
          style={{ fontFamily: "ui-monospace, monospace", color: colors.accent700 }}
        >
          POST /resume/upload
        </code>
        . PyMuPDF extracts the text server-side and the extracted string is stored with the
        resume record, so the interview agent reads prose — not a file — when it builds its
        prompt.
      </>
    ),
    strip: ["PDF upload, 10 MB cap", "PyMuPDF text extraction", "Stored on the resume row"],
    image: "Drop a screenshot of the Upload Resume screen",
  },
  {
    index: "02",
    kicker: "Role selection",
    title: "Pick the role. The interview is bound to it.",
    body: "Admins publish job descriptions with a title, a description and a skills list. Choosing one creates the interview row against both the resume and the JD, so every question, every score and every transcript stays traceable to a specific opening.",
    cards: [
      {
        kicker: "Open position",
        title: "Backend Engineer",
        body: "Skills parsed from the JD are shown as tags and passed into the interviewer prompt.",
        tags: ["FastAPI", "PostgreSQL", "WebRTC"],
      },
      {
        kicker: "Status",
        title: "One attempt per opening",
        body: "A candidate's existing interview shows as in progress or already completed, so the same role can't be re-run.",
      },
    ],
    image: "Drop a screenshot of the Choose Your Position screen",
  },
  {
    index: "03",
    kicker: "Live voice",
    title: "A real conversation, not a form.",
    body: "The client joins a LiveKit room over WebRTC and the agent joins beside it. Speech becomes text with Deepgram Nova-3, the model answers, and Cartesia Sonic-3 speaks it back — with turn detection and local VAD deciding when the candidate has finished a thought.",
    strip4: [
      { label: "Listen", value: "Deepgram Nova-3" },
      { label: "Think", value: "GPT via LiveKit inference" },
      { label: "Speak", value: "Cartesia Sonic-3" },
      { label: "Take turns", value: "Turn detection + Silero VAD" },
    ],
    image: "Drop a screenshot of the live interview screen — orb, timer, transcript",
    imageHeight: "h-[480px]",
    footnote:
      "The backend is deliberately outside the real-time loop — it never sits between a spoken answer and the next question.",
  },
  {
    index: "04",
    kicker: "Adaptive questions",
    title: "It gets harder when you're good at this.",
    body: "The interviewer prompt is assembled from the job description, the resume and any previous conversation history. It asks one question at a time, starts easy, and moves with the candidate.",
    rows: [
      {
        label: "Answers well",
        body: "Difficulty increases; the next question digs into design decisions and trade-offs.",
      },
      {
        label: "Struggles",
        body: "Questions simplify rather than stall — the interview keeps moving without coaching.",
      },
      {
        label: "Answer lacks depth",
        body: "A follow-up asks for the implementation, the challenge, or the reason behind the choice.",
      },
      {
        label: "Claims a skill",
        body: "The resume is treated as evidence to verify, using the candidate's own projects.",
      },
    ],
  },
  {
    index: "05",
    kicker: "Evaluation",
    title: "Scored on reasoning, not on keywords.",
    body: "When the interview ends, the transcript is persisted and the agent writes an evaluation from the completed conversation — four scores and a written summary, stored against the interview.",
    scores: [
      { value: 78, label: "Technical knowledge" },
      { value: 72, label: "Problem solving" },
      { value: 85, label: "Communication" },
      { value: 81, label: "Relevance to JD", accent: true },
    ],
    image: "Drop a screenshot of the evaluation screen — score gauges and summary",
  },
  {
    index: "06",
    kicker: "Admin",
    title: "Everything the hiring side needs, and nothing else.",
    body: "Admins write and revise job descriptions, watch interviews land as they complete, and open any one of them to read the scores, the summary and the full transcript.",
    table: [
      { position: "Backend Engineer", candidate: "candidate@example.com", status: "completed", score: "81" },
      { position: "ML Engineer", candidate: "dev@example.com", status: "active", score: "—" },
      { position: "Frontend Engineer", candidate: "hire@example.com", status: "completed", score: "74" },
    ],
    image: "Drop a screenshot of the admin dashboard",
  },
];

const architecturePlanes = [
  {
    title: "React client",
    body: "Vite, React Router and the LiveKit React components. Holds the JWT, joins the room, renders the live transcript.",
    meta: "REST + JWT · WebRTC",
  },
  {
    title: "FastAPI control plane",
    body: "Auth, resumes, job descriptions, interview lifecycle, and the internal context endpoint the agent calls with its own credential.",
    meta: "SQLAlchemy · PostgreSQL",
  },
  {
    title: "LiveKit real-time plane",
    body: "A Python Agents worker joins the room, fetches the interview context once, and owns the conversation state for the session.",
    meta: "STT → LLM → TTS",
  },
];

const entities = ["Users", "Resumes", "Job descriptions", "Interviews", "Messages", "Evaluations"];

const navLinkStyle = {
  color: colors.text,
};

function StatusTag({ status }) {
  const isActive = status === "active";
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-wide"
      style={
        isActive
          ? { background: "#fff2ef", color: colors.accent700 }
          : { background: "#f8f4f4", color: "#444141" }
      }
    >
      {status}
    </span>
  );
}

export default function Showcase() {
  return (
    <div
      style={{ background: colors.bg, color: colors.text, fontFamily: "'Archivo', system-ui, sans-serif", overflowX: "clip" }}
      className="[scroll-behavior:smooth]"
    >
      {/* Nav */}
      <div
        className="sticky top-0 z-20 flex items-center gap-6 px-6 py-3.5 sm:px-10"
        style={{ background: colors.bg, borderBottom: `2px solid ${colors.text}66` }}
      >
        <span className="mr-auto text-lg font-extrabold tracking-tight">AhIre</span>
        <a
          href="#capabilities"
          className="hidden rounded-[10px] px-3.5 py-3 text-xs uppercase tracking-[0.08em] transition-colors hover:text-[#ae1800] sm:inline-flex"
          style={navLinkStyle}
        >
          Capabilities
        </a>
        <a
          href="#architecture"
          className="hidden rounded-[10px] px-3.5 py-3 text-xs uppercase tracking-[0.08em] transition-colors hover:text-[#ae1800] sm:inline-flex"
          style={navLinkStyle}
        >
          Architecture
        </a>
        <Link
          to="/login"
          className="inline-flex min-h-[44px] items-center rounded-xl px-[22px] text-[15px] font-semibold transition-transform hover:-translate-y-0.5"
          style={{ background: colors.accent, color: colors.bg }}
        >
          Start an interview
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-[1440px] px-6 pt-16 sm:px-10 sm:pt-24">
        <Reveal
          className="mb-8 text-xs uppercase tracking-[0.14em]"
          style={{ color: colors.accent700 }}
        >
          Agentic AI interview platform
        </Reveal>
        <h1
          className="max-w-[16ch] text-[48px] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-[72px] lg:text-[104px]"
        >
          {["An ", "AI ", "that ", "runs ", "the "].map((word, i) => (
            <motion.span
              key={word}
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: (60 + i * 80) / 1000, ease: REVEAL_EASE }}
            >
              {word}
            </motion.span>
          ))}
          {["first\u00A0", "interview."].map((word, i) => (
            <motion.span
              key={word}
              className="inline-block"
              style={{ color: colors.accent }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: (460 + i * 80) / 1000, ease: REVEAL_EASE }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:items-end">
          <Reveal delay={640}>
            <p className="max-w-[52ch] text-lg leading-relaxed sm:text-xl">
              A candidate uploads a resume, picks a role, and speaks with a voice agent that
              already read both. The conversation is transcribed, scored, and handed to the
              hiring team as a written evaluation.
            </p>
          </Reveal>
          <Reveal delay={720} className="flex flex-wrap gap-3 pb-1.5">
            <a
              href="#capabilities"
              className="inline-flex min-h-[52px] items-center rounded-[14px] px-7 text-base font-semibold transition-transform hover:-translate-y-1"
              style={{ background: colors.accent, color: colors.bg }}
            >
              See what it does
            </a>
            <a
              href="#architecture"
              className="inline-flex min-h-[52px] items-center rounded-[14px] border-2 px-7 text-base font-semibold transition-transform hover:-translate-y-1"
              style={{ borderColor: `${colors.text}66` }}
            >
              Read the architecture
            </a>
          </Reveal>
        </div>
      </section>

      {/* Hero image + stack strip */}
      <div className="mx-auto max-w-[1440px] px-6 pt-14 sm:px-10 sm:pt-18">
        <Reveal scale>
          <ImagePlaceholder
            label="Drop the hero photograph — a candidate mid-interview, or the product on screen"
            className="h-[56vh] min-h-[320px]"
          />
        </Reveal>
        <div
          className="mt-0 grid grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: `2px solid ${colors.text}66` }}
        >
          {stack.map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 90}
              className="border-r px-5 py-5 last:border-r-0"
              style={{ borderColor: `${colors.text}66` }}
            >
              <p className="mb-1.5 text-[11px] uppercase tracking-[0.1em]" style={{ color: colors.accent700 }}>
                {item.label}
              </p>
              <p className="font-extrabold">{item.value}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <section id="capabilities" className="mx-auto max-w-[1440px] px-6 pt-28 sm:px-10">
        {capabilities.map((cap, capIdx) => (
          <div
            key={cap.index}
            className="grid gap-10 pt-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12"
            style={{ borderTop: `2px solid ${colors.text}66`, marginTop: capIdx === 0 ? 0 : "7rem" }}
          >
            <div>
              <div className="lg:sticky lg:top-[110px]">
                <p className="text-[64px] font-extrabold leading-none" style={{ color: colors.accent }}>
                  {cap.index}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.1em]" style={{ color: `${colors.text}99` }}>
                  {cap.kicker}
                </p>
              </div>
            </div>
            <div>
              <Reveal className="mb-6 max-w-[22ch] text-[32px] font-extrabold leading-[1.05] sm:text-[44px] lg:text-[52px]">
                {cap.title}
              </Reveal>
              <Reveal delay={80} className="max-w-[60ch] text-lg leading-relaxed [text-wrap:pretty]">
                {cap.body}
              </Reveal>

              {cap.strip && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: `1px solid ${colors.text}66` }}>
                  {cap.strip.map((s, i) => (
                    <Reveal
                      key={s}
                      delay={140 + i * 60}
                      className="border-r px-5 py-4 last:border-r-0"
                      style={{ borderColor: `${colors.text}66` }}
                    >
                      <p className="text-[15px]">{s}</p>
                    </Reveal>
                  ))}
                </div>
              )}

              {cap.strip4 && (
                <div className="mt-10 grid grid-cols-2 lg:grid-cols-4" style={{ borderTop: `1px solid ${colors.text}66` }}>
                  {cap.strip4.map((s, i) => (
                    <Reveal
                      key={s.label}
                      delay={140 + i * 60}
                      className="border-r px-4 py-4 last:border-r-0"
                      style={{ borderColor: `${colors.text}66` }}
                    >
                      <p className="mb-1 text-[11px] uppercase tracking-[0.1em]" style={{ color: colors.accent700 }}>
                        {s.label}
                      </p>
                      <p className="text-[15px]">{s.value}</p>
                    </Reveal>
                  ))}
                </div>
              )}

              {cap.cards && (
                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  {cap.cards.map((card, i) => (
                    <Reveal
                      key={card.title}
                      delay={140 + i * 80}
                      className="flex flex-col gap-3 rounded-2xl border-2 p-7 transition-all hover:-translate-y-1"
                      style={{ borderColor: `${colors.text}66`, background: colors.surface }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: colors.accent }}>
                        {card.kicker}
                      </p>
                      <p className="text-[17px] font-extrabold">{card.title}</p>
                      <p className="text-[13px] opacity-80">{card.body}</p>
                      {card.tags && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {card.tags.map((tag, ti) => (
                            <span
                              key={tag}
                              className="rounded-full px-3 py-1 text-[11px]"
                              style={
                                ti === 0
                                  ? { background: "#fff2ef", color: colors.accent700 }
                                  : { border: `1px solid ${colors.accent}`, color: colors.accent }
                              }
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Reveal>
                  ))}
                </div>
              )}

              {cap.rows && (
                <div className="mt-10" style={{ borderTop: `1px solid ${colors.text}66` }}>
                  {cap.rows.map((row, i) => (
                    <Reveal
                      key={row.label}
                      delay={140 + i * 60}
                      className="grid gap-4 py-4 sm:grid-cols-[180px_minmax(0,1fr)]"
                      style={{ borderBottom: `1px solid ${colors.text}66` }}
                    >
                      <p className="text-[15px] font-extrabold tracking-[0.02em]">{row.label}</p>
                      <p className="text-base leading-relaxed">{row.body}</p>
                    </Reveal>
                  ))}
                </div>
              )}

              {cap.scores && (
                <div className="mt-10 grid grid-cols-2 lg:grid-cols-4" style={{ borderTop: `2px solid ${colors.text}66` }}>
                  {cap.scores.map((s, i) => (
                    <Reveal
                      key={s.label}
                      delay={140 + i * 60}
                      className="border-r px-5 py-6 last:border-r-0"
                      style={{ borderColor: `${colors.text}66` }}
                    >
                      <p
                        className="text-[40px] font-extrabold leading-none"
                        style={s.accent ? { color: colors.accent } : undefined}
                      >
                        {s.value}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.1em]" style={{ color: `${colors.text}99` }}>
                        {s.label}
                      </p>
                    </Reveal>
                  ))}
                </div>
              )}

              {cap.table && (
                <Reveal delay={140} className="mt-10 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${colors.text}66` }}>
                        {["Position", "Candidate", "Status", "Score"].map((h) => (
                          <th key={h} className="px-4.5 py-3.5 text-left text-[11px] uppercase tracking-[0.08em]" style={{ color: `${colors.text}99` }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cap.table.map((row) => (
                        <tr key={row.candidate} style={{ borderBottom: `1px solid ${colors.text}66` }}>
                          <td className="px-4.5 py-4">{row.position}</td>
                          <td className="px-4.5 py-4">{row.candidate}</td>
                          <td className="px-4.5 py-4">
                            <StatusTag status={row.status} />
                          </td>
                          <td className="px-4.5 py-4">{row.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Reveal>
              )}

              {cap.image && (
                <Reveal scale delay={120} className="mt-10">
                  <ImagePlaceholder label={cap.image} className={cap.imageHeight ?? "h-[420px]"} />
                </Reveal>
              )}

              {cap.footnote && (
                <Reveal delay={80} className="mt-3 text-[13px] tracking-[0.04em]" style={{ color: `${colors.text}99` }}>
                  {cap.footnote}
                </Reveal>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Architecture */}
      <section id="architecture" className="mx-auto max-w-[1440px] px-6 pt-28 sm:px-10">
        <div className="pt-8" style={{ borderTop: `2px solid ${colors.text}66` }}>
          <Reveal className="mb-6 text-[11px] uppercase tracking-[0.1em]" style={{ color: colors.accent700 }}>
            Architecture
          </Reveal>
          <Reveal delay={80} className="mb-12 max-w-[26ch] text-[32px] font-extrabold leading-[1.05] sm:text-[44px] lg:text-[52px]">
            Two planes: one for records, one for the conversation.
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-3" style={{ borderTop: `1px solid ${colors.text}66` }}>
            {architecturePlanes.map((plane, i) => (
              <Reveal key={plane.title} delay={120 + i * 80} className="border-r px-0 py-8 last:border-r-0 sm:px-8" style={{ borderColor: `${colors.text}66` }}>
                <p className="mb-4 text-[22px] font-extrabold">{plane.title}</p>
                <p className="mb-4 text-base leading-relaxed">{plane.body}</p>
                <p className="text-[13px]" style={{ color: `${colors.text}99` }}>{plane.meta}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="grid grid-cols-2 sm:grid-cols-6" style={{ borderTop: `2px solid ${colors.text}66` }}>
            {entities.map((entity) => (
              <div key={entity} className="border-r px-3 py-4.5 last:border-r-0" style={{ borderColor: `${colors.text}66` }}>
                <p className="text-sm">{entity}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        id="close"
        className="mt-28 px-6 py-28 sm:px-10"
        style={{ background: colors.accent, color: colors.bg }}
      >
        <div className="mx-auto max-w-[1440px]">
          <Reveal className="max-w-[20ch] text-[40px] font-extrabold leading-none tracking-[-0.03em] sm:text-[60px] lg:text-[88px]" style={{ color: colors.bg }}>
            Screen every candidate the way you'd screen the first one.
          </Reveal>
          <div className="mt-12 flex flex-wrap gap-3">
            <Reveal delay={120}>
              <Link
                to="/login"
                className="inline-flex min-h-[52px] items-center rounded-[14px] border-2 px-7 text-base font-semibold transition-transform hover:-translate-y-1"
                style={{ background: colors.bg, color: colors.text, borderColor: colors.bg }}
              >
                Start an interview
              </Link>
            </Reveal>
            <Reveal delay={180}>
              <a
                href="#architecture"
                className="inline-flex min-h-[52px] items-center rounded-[14px] border-2 px-7 text-base font-semibold transition-transform hover:-translate-y-1"
                style={{ background: "transparent", color: colors.bg, borderColor: colors.bg }}
              >
                Read the architecture
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div
        className="flex flex-wrap items-baseline gap-6 px-6 py-8 sm:px-10"
        style={{ borderTop: `2px solid ${colors.text}66` }}
      >
        <span className="mr-auto text-base font-extrabold">AhIre</span>
        <span className="text-xs" style={{ color: `${colors.text}99` }}>
          Agentic AI interview platform · React · FastAPI · LiveKit · PostgreSQL
        </span>
      </div>
    </div>
  );
}
