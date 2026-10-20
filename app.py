from pathlib import Path

from flask import Flask, flash, jsonify, render_template, request, send_from_directory

from services.weather_service import WeatherService

# Configuración de Flask
app = Flask(
    __name__,
    static_folder="public",
    static_url_path="/public"
)

app.secret_key = "cambia-esta-clave-en-produccion"

# Configuración del modelo
MODEL_PATH = Path("models/weather_model.joblib")
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

TARGET = "rain"
FRONTEND_DIST = Path("frontend/dist")
weather_service = WeatherService(MODEL_PATH, TARGET)

@app.route("/", methods=["GET"])
def index():
    if FRONTEND_DIST.exists():
        return send_from_directory(FRONTEND_DIST, "index.html")
    return render_template(
        "index.html",
        results=None,
        prediction_features=None,
        prediction_result=None
    )

@app.post("/api/train")
def train_api():
    uploaded = request.files.get("dataset")

    if uploaded is None or not uploaded.filename:
        return jsonify({"error": "Selecciona un archivo CSV."}), 400

    if not uploaded.filename.lower().endswith(".csv"):
        return jsonify({"error": "El archivo debe tener extensión .csv."}), 400

    try:
        return jsonify(weather_service.train(uploaded.stream))

    except Exception as exc:
        app.logger.exception("Error durante el entrenamiento")
        return jsonify({"error": f"No se pudo procesar el dataset: {exc}"}), 422


@app.post("/train")
def train_legacy():
    """Mantiene compatible la plantilla Jinja durante la transición a React."""
    uploaded = request.files.get("dataset")
    if uploaded is None or not uploaded.filename:
        flash("Selecciona un archivo CSV.")
        return index()

    try:
        results = weather_service.train(uploaded.stream)
        return render_template(
            "index.html",
            results={
                **results,
                "model_path": str(MODEL_PATH),
            },
            prediction_features=[field["name"] for field in results["feature_schema"]],
            prediction_result=None,
        )
    except Exception as exc:
        app.logger.exception("Error durante el entrenamiento")
        flash(f"No se pudo procesar el dataset: {exc}")
        return index()

@app.get("/api/model-info")
def model_info_api():
    try:
        return jsonify(weather_service.model_info())
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 404


@app.post("/api/predict")
def predict_api():
    payload = request.get_json(silent=True) or {}

    try:
        return jsonify(weather_service.predict(payload))

    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        app.logger.exception("Error durante la predicción")
        return jsonify({"error": f"No se pudo generar la predicción: {exc}"}), 422


@app.post("/predict")
def predict_legacy():
    """Mantiene compatible el formulario Jinja anterior."""
    try:
        result = weather_service.predict(request.form.to_dict())
        info = weather_service.model_info()
        return render_template(
            "index.html",
            results=None,
            prediction_features=[field["name"] for field in info["feature_schema"]],
            prediction_result=result,
        )
    except Exception as exc:
        app.logger.exception("Error durante la predicción")
        flash(f"No se pudo generar la predicción: {exc}")
        return index()


@app.get("/assets/<path:filename>")
def frontend_assets(filename):
    return send_from_directory(FRONTEND_DIST / "assets", filename)

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )

