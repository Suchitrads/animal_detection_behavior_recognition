import torch
import cv2
from flask import Flask, request, jsonify, send_from_directory
from ultralytics import YOLO
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
import os
from datetime import datetime
from flask_cors import CORS
from werkzeug.utils import secure_filename
import exifread

app = Flask(__name__, static_folder='static')
UPLOAD_FOLDER = os.path.join('static', 'uploads')
RESULT_FOLDER = os.path.join('static', 'results')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

CORS(app)

# -------- Load YOLOv8 Model --------
try:
    yolo_model = YOLO("C:/Users/BHANU TEJA A/suchi_final_year_project/runs/animal_detector6/weights/best.pt")
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    yolo_model = None

# -------- Custom CNN Model --------
class CustomCNN(torch.nn.Module):
    def __init__(self, num_classes=7):
        super(CustomCNN, self).__init__()
        self.conv1 = torch.nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1)
        self.bn1 = torch.nn.BatchNorm2d(64)
        self.conv2 = torch.nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1)
        self.bn2 = torch.nn.BatchNorm2d(128)
        self.conv3 = torch.nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1)
        self.bn3 = torch.nn.BatchNorm2d(256)
        self.pool = torch.nn.MaxPool2d(kernel_size=2, stride=2)
        self.fc1 = torch.nn.Linear(256 * 16 * 16, 512)
        self.dropout = torch.nn.Dropout(0.5)
        self.fc2 = torch.nn.Linear(512, num_classes)

    def forward(self, x):
        x = self.pool(torch.relu(self.bn1(self.conv1(x))))
        x = self.pool(torch.relu(self.bn2(self.conv2(x))))
        x = self.pool(torch.relu(self.bn3(self.conv3(x))))
        x = x.view(x.size(0), -1)
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        return self.fc2(x)

# -------- Load Trained CNN Model --------
try:
    cnn_model = CustomCNN(num_classes=7)
    cnn_model.load_state_dict(torch.load(
        "C:/Users/BHANU TEJA A/suchi_final_year_project/best_model_20250501-225502.pth",
        map_location=torch.device('cpu')))
    cnn_model.eval()
    print("CNN model loaded successfully.")
except Exception as e:
    print(f"Error loading CNN model: {e}")
    cnn_model = None

# -------- Transform --------
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor()
])

# -------- Behavior Labels --------
behavior_labels = [
    'Deer_resting', 'Deer_running', 'Deer_grazing',
    'Elephant_grazing', 'Elephant_trumpeting',
    'Zebra_running', 'Zebra_grazing'
]

# -------- Extract GPS from image --------
def extract_gps(img_path):
    try:
        with open(img_path, 'rb') as f:
            tags = exifread.process_file(f)

        def get_coord(tag_name):
            if tag_name not in tags:
                return None
            coords = tags[tag_name].values
            d = float(coords[0].num) / coords[0].den
            m = float(coords[1].num) / coords[1].den
            s = float(coords[2].num) / coords[2].den
            return d + (m / 60.0) + (s / 3600.0)

        lat = get_coord('GPS GPSLatitude')
        lon = get_coord('GPS GPSLongitude')

        lat_ref = tags.get('GPS GPSLatitudeRef')
        lon_ref = tags.get('GPS GPSLongitudeRef')

        if lat and lat_ref and lat_ref.values[0] == 'S':
            lat = -lat
        if lon and lon_ref and lon_ref.values[0] == 'W':
            lon = -lon

        location = {"latitude": lat, "longitude": lon} if lat and lon else None
        if location:
            location["google_map_url"] = f"https://www.google.com/maps?q={lat},{lon}"
        return location
    except:
        return None

# -------- Extract timestamp from EXIF or fallback --------
def get_image_timestamp(img_path):
    try:
        with open(img_path, 'rb') as f:
            tags = exifread.process_file(f)

        datetime_tag = tags.get("EXIF DateTimeOriginal") or tags.get("Image DateTime")
        print("EXIF Tags found:", tags.keys())
        print("DateTimeOriginal:", datetime_tag)

        if datetime_tag:
            dt_str = str(datetime_tag)  # format: "YYYY:MM:DD HH:MM:SS"
            dt_obj = datetime.strptime(dt_str, "%Y:%m:%d %H:%M:%S")
            return int(dt_obj.timestamp() * 1000)
    except Exception as e:
        print(f"Error extracting image timestamp: {e}")

    return int(datetime.now().timestamp() * 1000)

# -------- Prediction --------
def make_prediction(img_path):
    if not yolo_model or not cnn_model:
        return None

    image = cv2.imread(img_path)
    results = yolo_model(image)[0]

    if results.boxes is None or len(results.boxes) == 0:
        return None

    animal_counts = {}
    behavior_list = {}

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        class_id = int(box.cls[0])
        class_name = yolo_model.names[class_id]
        conf_score = float(box.conf[0])

        crop = image[y1:y2, x1:x2]
        pil_crop = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
        input_tensor = transform(pil_crop).unsqueeze(0)

        with torch.no_grad():
            outputs = cnn_model(input_tensor)
            behavior_idx = outputs.argmax().item()
            behavior = behavior_labels[behavior_idx]

        behavior_only = behavior.split('_')[-1]
        label = f"{class_name}_{behavior_only}"

        behavior_list[label] = behavior_list.get(label, 0) + 1
        animal_counts[class_name] = animal_counts.get(class_name, 0) + 1

        display_text = f"{label} ({conf_score:.2f})"
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(image, display_text, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    timestamp = get_image_timestamp(img_path)

    output_filename = f"output_{timestamp}.jpg"
    output_image_path = os.path.join(RESULT_FOLDER, output_filename)
    cv2.imwrite(output_image_path, image)

    location = extract_gps(img_path)

    return {
        "imageUrl": f"http://127.0.0.1:5000/{output_image_path.replace(os.sep, '/')}",
        "summary": {
            "animal_counts": animal_counts,
            "behaviors": behavior_list
        },
        "location": location,
        "timestamp": timestamp
    }

# -------- Prediction Endpoint --------
@app.route('/predict', methods=['POST'])
def predict():
    if 'images' not in request.files:
        return jsonify({"error": "No image files provided."}), 400

    files = request.files.getlist('images')
    if not files:
        return jsonify({"error": "No files received."}), 400

    detected = []
    skipped = []

    for file in files:
        if file.filename == '':
            continue

        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_path = os.path.join(UPLOAD_FOLDER, f"{timestamp}_{filename}")
        file.save(file_path)

        prediction = make_prediction(file_path)

        if prediction:
            detected.append(prediction)
        else:
            skipped.append(filename)

    return jsonify({
        "detected": detected,
        "skipped": skipped,
        "count": {
            "total": len(files),
            "detected": len(detected),
            "skipped": len(skipped)
        }
    }), 200

# -------- Serve Output Files --------
@app.route('/static/results/<path:filename>')
def serve_result_files(filename):
    return send_from_directory('static/results', filename)

if __name__ == '__main__':
    app.run(debug=True)
