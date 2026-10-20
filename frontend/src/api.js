async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la solicitud.");
  }

  return data;
}

export function trainModel(file) {
  const formData = new FormData();
  formData.append("dataset", file);

  return request("/api/train", {
    method: "POST",
    body: formData,
  });
}

export function predict(values) {
  return request("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}