import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function statusBadgeClasses(status) {
  if (status === "completed") {
    return "bg-green-100 text-green-700";
  }

  if (status === "active") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-red-100 text-red-700";
}

function AdminDashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/interview/results", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              <span className="text-orange-500">A</span>h
              <span className="text-orange-500">I</span>re Admin
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              Interview evaluations for your company.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin/jds"
              className="h-11 px-5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:border-orange-500 hover:text-orange-500 transition flex items-center"
            >
              Job Descriptions
            </Link>

            <button
              onClick={logout}
              className="h-11 px-5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:border-orange-500 hover:text-orange-500 transition"
            >
              Log Out
            </button>
          </div>
        </div>

        {loading && (
          <p className="mt-12 text-slate-500">Loading interviews...</p>
        )}

        {!loading && results.length === 0 && (
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">
              No interviews yet for your company.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          {results.map((result) => (
            <div
              key={result.interview_id}
              onClick={() => navigate(`/admin/interview/${result.interview_id}`)}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {result.jd_title}
                </h2>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${statusBadgeClasses(
                    result.status
                  )}`}
                >
                  {result.status}
                </span>
              </div>

              <p className="mt-6 text-slate-600">
                Candidate: {result.candidate_email}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {new Date(result.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
