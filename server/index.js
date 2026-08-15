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

  socket.on("join-room", ({ roomId, files }) => {
  socket.join(roomId);

  console.log(`${socket.id} joined ${roomId}`);

  if (!roomFiles.has(roomId)) {
    const fileMap = new Map();

    files.forEach((file) => {
      fileMap.set(file.name, file.content);
    });

    roomFiles.set(roomId, fileMap);

    console.log(`Created room: ${roomId}`);
    return;
  }

  const savedFiles = roomFiles.get(roomId);

  for (const [fileName, code] of savedFiles) {
    socket.emit("code-update", {
      fileName,
      code,
    });
  }
  socket.on("create-file", ({ roomId, file }) => {
  if (!roomFiles.has(roomId)) {
    roomFiles.set(roomId, new Map());
  }

  roomFiles.get(roomId).set(file.name, file.content);

  socket.to(roomId).emit("file-created", file);
});

socket.on("delete-file", ({ roomId, fileName }) => {
  const files = roomFiles.get(roomId);

  if (!files) return;

  files.delete(fileName);

  socket.to(roomId).emit("file-deleted", {
    fileName,
  });
});

socket.on("rename-file", ({ roomId, oldName, newFile }) => {
  const files = roomFiles.get(roomId);

  if (!files) return;

  const oldContent = files.get(oldName);

  files.delete(oldName);

  files.set(newFile.name, oldContent ?? "");

  socket.to(roomId).emit("file-renamed", {
    oldName,
    newFile,
  });
});
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
