export const featureLabels = {
  temperature: "Temperatura",
  humidity: "Humedad",
  pressure: "Presión atmosférica",
  wind_speed: "Velocidad del viento",
};

export const metricLabels = {
  accuracy: "Exactitud",
  precision: "Precisión",
  recall: "Sensibilidad",
  f1: "Puntaje F1",
};

export function getFeatureLabel(name) {
  return featureLabels[name] || name.replaceAll("_", " ");
}

export function getPredictionLabel(label) {
  const translatedLabels = { Yes: "Sí", No: "No" };
  return translatedLabels[label] || label;
}

export function getPredictionMessage(label) {
  if (label === "Yes") return "Es probable que llueva.";
  if (label === "No") return "No es probable que llueva.";
  return `El modelo estima: ${getPredictionLabel(label)}.`;
}