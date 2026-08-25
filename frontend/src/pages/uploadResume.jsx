import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UploadResume() {
  const token = localStorage.getItem("token");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResume = async () => {
      const response = await fetch("http://127.0.0.1:8000/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResume(data);
      }
    };

    fetchResume();
  }, []);
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    console.log("Token from localStorage:", token);
    const formData = new FormData();
    formData.append("file", file);
    console.log("Token:", token);
    const response = await fetch("http://127.0.0.1:8000/resume/upload", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("UPLOAD RESPONSE");
    localStorage.setItem("resume_id", data.resume_id);

    setLoading(false);

    navigate("/jds");
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center px-6">
      <div className="grid lg:grid-cols-2 max-w-6xl w-full gap-20 items-center">
        {/* Left Section */}
        <div>
          <h1 className="text-6xl font-black mb-6">
            <span className="text-orange-500">A</span>h
            <span className="text-orange-500">I</span>re
          </h1>

          <h2 className="text-5xl font-bold text-slate-900 leading-tight">
            Upload Your
            <br />
            Resume
          </h2>

          <p className="mt-6 text-lg text-slate-600 leading-8 max-w-lg">
            We'll analyze your resume, extract your skills, and match you with
            relevant job opportunities before starting your AI screening
            interview.
          </p>

          <div className="mt-12 bg-orange-50 rounded-3xl p-8 border border-orange-100">
            <div className="flex justify-between mb-6">
              <span className="font-semibold text-slate-700">
                Resume Parsing
              </span>

              <span className="text-green-600 font-semibold">AI Ready</span>
            </div>

            <div className="w-full bg-orange-100 rounded-full h-3">
              <div className="bg-orange-500 h-3 rounded-full w-4/5"></div>
            </div>

            <p className="mt-4 text-slate-500">
              PDF resumes are automatically parsed and analyzed for skills and
              experience.
            </p>
          </div>
        </div>

        {/* Right Section */}
<div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">

  <h2 className="text-3xl font-bold text-slate-900">
    Resume Upload
  </h2>

  <p className="text-slate-500 mt-2">
    Upload your latest resume in PDF format.
  </p>

  {resume && (
  <>
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
          ✓
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-green-700">
              Resume Found
            </h3>

            <span className="text-xs text-green-600 font-medium">
              Ready
            </span>
          </div>

          <p className="text-sm text-slate-500 truncate">
            {resume.file_path.split("/").pop()}
          </p>
        </div>
      </div>
    </div>

    <button
      className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white h-11 rounded-xl font-semibold transition"
      onClick={() => {
        localStorage.setItem("resume_id", resume.id);
        navigate("/jds");
      }}
    >
      Continue
    </button>

    <div className="my-5 flex items-center">
      <div className="flex-1 border-t border-slate-200"></div>

      <span className="mx-3 text-xs text-slate-400 font-medium">
        OR
      </span>

      <div className="flex-1 border-t border-slate-200"></div>
    </div>

    <p className="text-center text-sm text-slate-500 mb-5">
      Upload a new resume to replace the current one.
    </p>
  </>
)}

  <label className="border-2 border-dashed border-orange-300 rounded-2xl h-40 flex flex-col justify-center items-center cursor-pointer hover:bg-orange-50 transition">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 text-orange-500 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>

    <p className="text-slate-700 font-semibold">
      Click to choose your resume
    </p>

    <p className="text-slate-500 text-sm mt-2">
      PDF • Max 10 MB
    </p>

    <input
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={(e) => setFile(e.target.files[0])}
    />
  </label>

  {file && (
    <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
      <p className="font-semibold text-green-700">
        {file.name}
      </p>
    </div>
  )}

  <button
    disabled={loading}
    onClick={handleUpload}
    className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl font-semibold transition"
  >
    {loading
      ? "Uploading..."
      : resume
      ? "Replace Resume"
      : "Upload Resume"}
  </button>

</div>
      </div>
    </div>
  );
}

export default UploadResume;
