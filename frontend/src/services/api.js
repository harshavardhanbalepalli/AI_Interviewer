const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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