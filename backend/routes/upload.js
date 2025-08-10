const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  const { userId } = req.body;

  try {
    const newImage = new Image({
      userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
    });
    await newImage.save();

    res.status(201).json({ message: 'Image uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
