import os
import joblib

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "priority_model.joblib"
)

model = None

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)


def predict_priority(data):
    if model is None:
        return None

    features = [[
        data["stakeholder_value"],
        data["development_risk"],
        data["urgency"],
        data["complexity"]
    ]]

    prediction = model.predict(features)[0]

    probabilities = model.predict_proba(features)[0]

    confidence = float(max(probabilities))

    return {
        "prediction": str(prediction),
        "confidence": round(confidence, 3)
    }