const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process'); // for running Python
const router = express.Router();

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder to save uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({ storage: storage });

// Route to handle image upload and prediction
router.post('/predict', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  // Spawn Python script
  const python = spawn('python', ['ml_model.py', imagePath]);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on('close', (code) => {
    if (code === 0) {
      res.json({ prediction: result.trim() });
    } else {
      res.status(500).json({ error: 'ML Model failed' });
    }
  });
});

module.exports = router;
