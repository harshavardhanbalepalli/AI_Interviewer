import { useState } from "react";
import { useNavigate } from "react-router-dom";
function Interview() {
 const navigate = useNavigate();
  const [answer, setAnswer] =
    useState("");

  const [question, setQuestion] =
    useState(
      localStorage.getItem("question")
    );
    const submitAnswer = async () => {

  const interview_id =
    localStorage.getItem(
      "interview_id"
    );

  const response = await fetch(
    "http://127.0.0.1:8000/interview/answer",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        interview_id,
        answer
      })
    }
  );

  const data =
    await response.json();

  setQuestion(data.question);

  setAnswer("");
};
const endInterview = async () => {

  const interview_id =
    localStorage.getItem(
      "interview_id"
    );

  const response = await fetch(
    "http://127.0.0.1:8000/interview/end",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        interview_id:
          Number(interview_id)
      })
    }
  );

  const data =
    await response.json();

  console.log(data);
  localStorage.setItem(
  "evaluation",
  JSON.stringify(data)
);

navigate("/result");
};
  return (
    <div>

      <h2>
        {question}
      </h2>

      <textarea
        value={answer}
        onChange={(e) =>
          setAnswer(e.target.value)
        }
      />

      <button
  onClick={submitAnswer}
>
  Submit Answer
</button>

<button
  onClick={endInterview}
>
  End Interview
</button>
    </div>
  );
}

export default Interview;