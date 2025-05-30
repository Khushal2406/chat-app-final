const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateProfilePic,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.put("/updatepic", protect, updateProfilePic);

module.exports = router;