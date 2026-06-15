const BASE_URL = "http://127.0.0.1:8000";

export async function uploadResume(formData) {
  const response = await fetch(
    `${BASE_URL}/resume/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return response.json();
}