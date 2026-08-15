const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const roomFiles = new Map();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    console.log(`${socket.id} joined ${roomId}`);

    const savedFiles = roomFiles.get(roomId);

    if (savedFiles) {
      for (const [fileName, code] of savedFiles) {
        socket.emit("code-update", { fileName, code });
      }
    }
  });

  socket.on("code-change", ({ roomId, fileName, code }) => {
    console.log("Code changed in:", roomId);

    if (!roomFiles.has(roomId)) {
      roomFiles.set(roomId, new Map());
    }

    roomFiles.get(roomId).set(fileName, code);

    socket.to(roomId).emit("code-update", { fileName, code });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
