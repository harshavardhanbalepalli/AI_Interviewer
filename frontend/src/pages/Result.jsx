function Result() {

  const evaluation =
    JSON.parse(
      localStorage.getItem(
        "evaluation"
      )
    );

  return (
    <div>
      <h1>Interview Result</h1>

      <pre>
        {evaluation.evaluation}
      </pre>
    </div>
  );
}

export default Result;