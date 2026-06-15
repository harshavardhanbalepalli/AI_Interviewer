import { useState } from "react";

function UploadResume() {
    const [file, setFile] = useState(null);
    const handleUpload = async () => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/resume/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();
localStorage.setItem(
  "resume_id",
  data.resume_id
);
  console.log(data);
};
  return (
    
    <div>
        <input
  type="file"
  onChange={(e) => setFile(e.target.files[0])}
/>
<button onClick={handleUpload}>
  Upload
</button>
    </div>
  );
}

export default UploadResume;