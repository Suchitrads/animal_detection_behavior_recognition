const express = require("express");
const router = express.Router();


// POST: Add history entry
router.post("/add", async (req, res) => {
  try {
    const { userId, imageUrl, summary } = req.body;

    const historyEntry = new History({
      userId,
      imageUrl,
      summary,
    });

    await historyEntry.save();
    res.status(201).json({ msg: "History entry saved." });
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).json({ msg: "Server error while saving history." });
  }
});

// GET: Get history for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const history = await History.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ msg: "Server error while fetching history." });
  }
});

module.exports = router;
