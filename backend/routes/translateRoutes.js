const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { translateText, translateBatch } = require("../controllers/translateController");

const router = express.Router();

router.post("/", protect, translateText);
router.post("/batch", protect, translateBatch);

module.exports = router; 