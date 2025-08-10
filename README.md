Animal Detection & Behavior Recognition - User Guide
This project detects animals in images and recognizes their behaviors using a YOLOv8 object detection model and a custom CNN classifier trained on annotated datasets.
📦 Prerequisites
- Node.js (v16+)
- Python (3.8+)
- MongoDB (local or Atlas cloud)
- Git

Datasets
This project uses two datasets:
1. Animal Detection Dataset – Used for training the YOLOv8 model.
2. Behavior Recognition Dataset – Used for training the CNN classifier.

Both datasets are annotated and must be downloaded before running the project.
Download links:
https://drive.google.com/drive/folders/1uU-EjdVO9keYNkrRa-UlTr-WO-U7zV6L?usp=drive_link


Steps After Downloading the Project
1. Clone the repository:
   git clone https://github.com/Suchitrads/animal-detection-behavior-recognition.git
   cd animal-detection-behavior-recognition

2. Setup the frontend:
   cd frontend
   npm install
   npm start

3. Setup the backend (Node.js + Flask):
   cd ../backend
   npm install
   Create a .env file based on .env.example and update values:
       PORT=5000
       MONGO_URI=your_mongodb_connection_string
       FLASK_PORT=5000

4. Install Python dependencies:
   pip install -r requirements.txt

5. Download the trained model weights:
   Place them in backend

6. Run the services:
   Terminal 1 (backend): node server.js
   Terminal 2 (backend): python app.py
   Terminal 3 (frontend): npm start

7. Open your browser at http://localhost:3000
⚠️ Notes
- Ensure MongoDB is running before starting the backend.
- Models and datasets are not included in the repository due to size.
- Update paths in app.py to match your system setup.
