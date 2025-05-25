const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/user/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);

  if (!email || !password) {
    console.log("Missing email or password");
    res.status(400);
    throw new Error("Please provide both email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    console.log("User not found:", email);
    res.status(401);
    throw new Error("Invalid Email or Password");
  }

  const isPasswordValid = await user.matchPassword(password);
  console.log("Password validation result:", isPasswordValid);

  if (user && isPasswordValid) {
    console.log("Login successful for user:", email);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    console.log("Invalid password for user:", email);
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     Update user profile picture
//@route           PUT /api/user/updatepic
//@access          Protected
const updateProfilePic = asyncHandler(async (req, res) => {
  const { pic } = req.body;

  if (!pic) {
    res.status(400);
    throw new Error("Please provide a profile picture URL");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { pic },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    pic: updatedUser.pic,
    token: generateToken(updatedUser._id),
  });
});

module.exports = { allUsers, registerUser, authUser, updateProfilePic };