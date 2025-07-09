from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# ✅ OpenRouter API key and model
API_KEY = "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"
MODEL = "openrouter/cypher-alpha:free"

def get_health_advice(symptoms):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost",   # Optional
        "X-Title": "CypherHealthBot"            # Optional
    }

    prompt = f"""
    Given the symptoms: {symptoms}, predict possible diseases.
    For each disease, provide:
    - A brief description
    - Additional symptoms
    - Precautions
    - Suggested medications
    - Recommended workouts
    - Suitable diets
    - Expected outcomes.
    """

    payload = {
        "model": MODEL,
        "max_tokens": 1000,  # Keep within free token limits
        "messages": [
            {"role": "system", "content": "You are a helpful medical assistant."},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error {response.status_code}: {response.text}"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_health_assistance", methods=["POST"])
def get_health_assistance():
    try:
        data = request.get_json()
        symptoms = data.get("symptoms", "").strip()

        if not symptoms:
            return jsonify({"error": "Please enter symptoms."}), 400

        advice = get_health_advice(symptoms)
        return jsonify({"healthAdvice": advice})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
