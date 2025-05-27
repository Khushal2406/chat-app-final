const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { translateText } = require("../controllers/translateController");

const router = express.Router();

router.post("/", protect, translateText);

module.exports = router; 