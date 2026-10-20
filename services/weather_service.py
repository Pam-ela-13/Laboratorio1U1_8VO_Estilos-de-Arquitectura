from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

from filtros import (
    EvaluateModelFilter,
    LoadDatasetFilter,
    PrepareDataFilter,
    TrainModelFilter,
    ValidateDatasetFilter,
)


class WeatherService:
    """Orquesta el entrenamiento y la predicción sin depender de Flask."""

    def __init__(self, model_path: Path, target: str = "rain"):
        self.model_path = model_path
        self.target = target

    def train(self, file_stream):
        raw = LoadDatasetFilter().run(file_stream)
        validated = ValidateDatasetFilter(self.target).run(raw)
        X, y, info = PrepareDataFilter(self.target).run(validated)

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y,
        )

        model = TrainModelFilter().run(X_train, y_train, info)
        metrics = EvaluateModelFilter().run(model, X_test, y_test)

        model_data = {
            "model": model,
            "features": list(X.columns),
            "target": info["target"],
            "feature_types": {
                feature: "number"
                if feature in info["numeric_columns"]
                else "text"
                for feature in X.columns
            },
        }
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model_data, self.model_path)

        return {
            "rows": len(validated),
            "features": len(X.columns),
            "target": info["target"],
            "feature_schema": self._feature_schema(model_data),
            "class_distribution": {
                str(key): int(value)
                for key, value in y.value_counts().items()
            },
            "metrics": metrics,
        }

    def model_info(self):
        saved = self._load_model()
        return {
            "target": saved["target"],
            "feature_schema": self._feature_schema(saved),
        }

    def predict(self, values):
        saved = self._load_model()
        features = saved["features"]

        missing = [
            feature for feature in features
            if values.get(feature) is None or str(values[feature]).strip() == ""
        ]
        if missing:
            raise ValueError(
                "Completa los campos obligatorios: " + ", ".join(missing)
            )

        typed_values = {}
        for feature in features:
            value = values[feature]
            if saved["feature_types"][feature] == "number":
                try:
                    typed_values[feature] = float(value)
                except (TypeError, ValueError) as exc:
                    raise ValueError(
                        f"El campo '{feature}' debe ser numérico."
                    ) from exc
            else:
                typed_values[feature] = str(value).strip()

        sample = pd.DataFrame([typed_values], columns=features)
        model = saved["model"]
        prediction = model.predict(sample)[0]
        probability = None

        if hasattr(model, "predict_proba"):
            probability = round(
                float(max(model.predict_proba(sample)[0])) * 100,
                2,
            )

        return {
            "label": str(prediction),
            "probability": probability,
        }

    def _load_model(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                "Primero entrena un modelo con un archivo CSV."
            )
        return joblib.load(self.model_path)

    @staticmethod
    def _feature_schema(saved):
        return [
            {
                "name": feature,
                "type": saved["feature_types"].get(feature, "text"),
            }
            for feature in saved["features"]
        ]