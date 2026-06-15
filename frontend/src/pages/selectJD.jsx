import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function SelectJD() {
  const [jds, setJds] = useState([]);

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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_id: Number(resume_id),
        jd_id: Number(jd_id),
      }),
    });

    const data = await response.json();

    console.log(data);

    localStorage.setItem("interview_id", data.interview_id);

    localStorage.setItem("question", data.question);

    navigate("/interview");
  };
  return (
    <div>
      <h1>Select JD</h1>

      {jds.map((jd) => (
        <div key={jd.id}>
          <h3>{jd.title}</h3>
          <p>{jd.description}</p>
          <p>{jd.skills}</p>

          <button onClick={() => startInterview(jd.id)}>Select</button>
        </div>
      ))}
    </div>
  );
}

export default SelectJD;
