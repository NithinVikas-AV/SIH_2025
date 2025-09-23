// server/index.js
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const surveyRoutes = require('./routes/surveys');
const counselorsRoutes = require('./routes/counselors');
const appointmentsRoutes = require('./routes/appointments');
const db = require('./db');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your frontend's URL
  },
});

const onlineUsers = new Map(); // Stores userId -> socketId

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 1. User comes online
  socket.on("go-online", (userId) => {
    console.log(`User ${userId} is online.`);
    onlineUsers.set(userId, socket.id);
  });

  // 2. Sending a message
  socket.on("send-message", (message) => {
    // `message` is an object: { senderId, receiverId, text, createdAt, chatId }
    const receiverSocketId = onlineUsers.get(message.receiverId);
    if (receiverSocketId) {
      // If the receiver is online, send the message and a notification in real-time
      io.to(receiverSocketId).emit("receive-message", message);
      io.to(receiverSocketId).emit("new-message-notification", {
        senderId: message.senderId,
        text: message.text,
        chatId: message.chatId
      });
    }
    // The client will handle saving the message to Firestore
  });

  // 3. User goes offline
  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`User ${key} disconnected.`);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from your React app
app.use(express.json()); // Allow the server to parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/counselors', counselorsRoutes);
app.use('/api/appointments', appointmentsRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  if (db && db.pool) console.log('DB pool module loaded');
});