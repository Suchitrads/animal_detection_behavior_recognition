// 📁 models/History.js
const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },
  summary: {
    animal_counts: { type: Object, default: {} },
    behaviors: { type: Object, default: {} }
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", HistorySchema);


// 📁 routes/history.js
const express = require("express");
const router = express.Router();
const History = require("../models/History");

// POST: Save history entry
router.post("/add", async (req, res) => {
  try {
    const { userId, imageUrl, summary } = req.body;
    const history = new History({ userId, imageUrl, summary });
    await history.save();
    res.status(201).json({ msg: "History entry saved." });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ msg: "Server error while saving history." });
  }
});

// GET: Fetch all history for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const userHistory = await History.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(userHistory);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ msg: "Server error while fetching history." });
  }
});

// DELETE: Remove an individual history entry
router.delete("/delete/:id", async (req, res) => {
  try {
    await History.findByIdAndDelete(req.params.id);
    res.json({ msg: "History entry deleted." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ msg: "Server error while deleting history." });
  }
});

module.exports = router;