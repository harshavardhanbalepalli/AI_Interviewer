import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ScoreGauge from "@/components/ui/admin/ScoreGauge";

function AdminInterviewDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/interview/result/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading evaluation...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Interview not found.</p>
      </div>
    );
  }

  const evaluation = result.evaluation;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <Link
          to="/admin"
          className="text-orange-500 font-semibold hover:text-orange-600"
        >
          &larr; Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-slate-900 mt-4">
          Interview Evaluation
        </h1>

        <p className="mt-2 text-slate-500">
          Interview #{result.interview_id} &middot; {result.status}
        </p>

        {!evaluation && (
          <div className="mt-10 bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">
              Evaluation has not been generated yet.
            </p>
          </div>
        )}

        {evaluation && (
          <>
            <div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm p-10 flex justify-center">
              <ScoreGauge
                label="Overall Score"
                value={evaluation.overall_score}
                size="large"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <ScoreGauge
                  label="Technical Knowledge"
                  value={evaluation.technical_knowledge}
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <ScoreGauge
                  label="Problem Solving"
                  value={evaluation.problem_solving}
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <ScoreGauge
                  label="Communication"
                  value={evaluation.communication}
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <ScoreGauge
                  label="Relevance to JD"
                  value={evaluation.relevance_to_jd}
                />
              </div>
            </div>

            <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="font-semibold text-slate-800 mb-3">
                Summary
              </h3>

              <p className="text-slate-600 leading-7 whitespace-pre-wrap">
                {evaluation.summary}
              </p>
            </div>
          </>
        )}

        <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="font-semibold text-slate-800 mb-3">
            Transcript
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {result.transcript.map((msg, index) => {
              const isAgent = msg.role === "agent";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isAgent ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 ${
                      isAgent
                        ? "bg-slate-100 text-slate-900"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold">
                      {isAgent ? "Interviewer" : "Candidate"}
                    </p>

                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInterviewDetail;
