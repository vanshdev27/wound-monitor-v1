from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# --- Basic Setup ---
app = Flask(__name__)
CORS(app)

# --- Load Your Models ---
print("Loading XGBoost models from .pkl files...")
try:
    # model2.pkl is the HEALING CLASSIFIER
    healing_model = joblib.load('model2.pkl')
    
    # model1.pkl is the DAYS REGRESSOR
    days_model = joblib.load('model1.pkl')
    
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")


# --- API Endpoint for Healing Prediction ---
@app.route('/predict_healing', methods=['POST'])
def predict_healing():
    data = request.get_json()
    print(f"Received data for healing prediction: {data}")

    try:
        # Create a list of the feature values in the correct order for model2.pkl
        input_data = [
            float(data['pH_Value']),
            float(data['Temperature_Celsius']),
            float(data['Humidity'])
        ]
        input_array = np.array([input_data])
    except Exception as e:
        return jsonify({'error': f'Invalid input data format: {e}'}), 400

    prediction_probabilities = healing_model.predict_proba(input_array)
    predicted_class_index = np.argmax(prediction_probabilities)

    # ==============================================================================
    # ACTION: Class labels have been updated with your information.
    # ==============================================================================
    class_labels = {
        0: "Perfect Healing",
        1: "Good Healing",
        2: "Check Needed - Alert",
        3: "Emergency"
    }
    
    prediction = class_labels.get(predicted_class_index, "Unknown Class")

    return jsonify({'prediction': prediction})


# --- API Endpoint for Days Prediction ---
@app.route('/predict_days', methods=['POST'])
def predict_days():
    data = request.get_json()
    print(f"Received data for days prediction: {data}")

    try:
        # Create a list of the feature values in the correct order for model1.pkl
        input_data = [
            float(data['ph']),
            float(data['humidity_percent']),
            float(data['temp_c'])
        ]
        input_array = np.array([input_data])
    except Exception as e:
        return jsonify({'error': f'Invalid input data format: {e}'}), 400

    prediction_result = days_model.predict(input_array)
    predicted_days = int(prediction_result[0])

    return jsonify({'predicted_days': predicted_days})


# --- Run the Flask App ---
if __name__ == '__main__':
    print("Starting Flask server for ML models...")
    app.run(port=5001, debug=True)