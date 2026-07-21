function Result() {

  const evaluation =
    JSON.parse(
      localStorage.getItem(
        "evaluation"
      )
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-8">
          Interview Evaluation
        </h1>

        <div className="whitespace-pre-wrap leading-8 text-slate-300">
          {evaluation.evaluation}
        </div>

      </div>

    </div>
  );
}

export default Result;