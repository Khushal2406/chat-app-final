const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const translateRoutes = require("./routes/translateRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/translate", translateRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user connection
  socket.on("setup", (userData) => {
    console.log("User setup:", userData._id);
    socket.join(userData._id);
    connectedUsers.set(userData._id, socket.id);
    socket.emit("connected");
  });

  // Handle joining chat room
  socket.on("join chat", (room) => {
    console.log("User joined room:", room);
    socket.join(room);
  });

  // Handle typing
  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });

  // Handle new message
  socket.on("new message", (newMessageReceived) => {
    console.log("New message received:", newMessageReceived);
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});