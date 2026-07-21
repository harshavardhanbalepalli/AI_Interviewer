import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function SelectJD() {
  const [jds, setJds] = useState([]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/jd")
      .then((response) => response.json())
      .then((data) => {
        setJds(data);
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const navigate = useNavigate();
  const startInterview = async (jd_id) => {
    const resume_id = localStorage.getItem("resume_id");

    console.log("resume_id:", resume_id);
    console.log("jd_id:", jd_id);

    const response = await fetch("http://127.0.0.1:8000/interview/start", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_id: Number(resume_id),
        jd_id: Number(jd_id),
      }),
    });
console.log(response.status);

const data = await response.json();
localStorage.setItem(
    "livekit_token",
    data.livekit_token
);

localStorage.setItem(
    "room_name",
    data.room_name
);

console.log("START INTERVIEW RESPONSE");
console.log(data);

    console.log(data);

    localStorage.setItem("interview_id", data.interview_id);

    navigate("/interview");
  };
  return (
  <div className="min-h-screen bg-slate-50">

    <div className="max-w-7xl mx-auto px-8 py-12">

      <h1 className="text-5xl font-bold text-slate-900">
        Choose Your Position
      </h1>

      <p className="mt-3 text-lg text-slate-600">
        Select a role to begin your AI screening interview.
      </p>

      <div className="grid lg:grid-cols-2 gap-8 mt-12">

        {jds.map((jd) => (

          <div
            key={jd.id}
            className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition duration-300"
          >

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold text-slate-900">
                {jd.title}
              </h2>

              <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
                Open
              </span>

            </div>

            <p className="mt-6 text-slate-600 leading-7 line-clamp-4">
              {jd.description}
            </p>

            <div className="mt-8">

              <h3 className="font-semibold text-slate-800 mb-3">
                Required Skills
              </h3>

              <div className="flex flex-wrap gap-2">

                {jd.skills
                  .split(",")
                  .map((skill, index) => (

                    <span
                      key={index}
                      className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>

                  ))}

              </div>

            </div>

            <button
              onClick={() => startInterview(jd.id)}
              className="mt-10 w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl font-semibold transition"
            >
              Apply & Start AI Screening
            </button>

          </div>

        ))}

      </div>

    </div>

  </div>
);
}

export default SelectJD;
