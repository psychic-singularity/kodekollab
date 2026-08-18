/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const rooms = new Map();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"] },
});

const starterFiles = [
  {
    name: "index.js",
    language: "javascript",
    content: `const express = require("express");

const app = express();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});`,
  },
  {
    name: "app.js",
    language: "javascript",
    content: `function hello() {
  console.log("Hello World");
}

hello();`,
  },
  {
    name: "package.json",
    language: "json",
    content: `{
  "name": "collaborative-editor",
  "version": "1.0.0"
}`,
  },
];

function cloneFiles(files) {
  return files.map((file) => ({ ...file }));
}

function createRoom() {
  const roomId = crypto.randomUUID();
  rooms.set(roomId, { files: cloneFiles(starterFiles) });
  return roomId;
}

function roomPayload(roomId) {
  const room = rooms.get(roomId);
  return {
    roomId,
    files: cloneFiles(room.files),
    participantCount: io.sockets.adapter.rooms.get(roomId)?.size || 0,
  };
}

function emitParticipants(roomId) {
  io.to(roomId).emit("participants-updated", {
    count: io.sockets.adapter.rooms.get(roomId)?.size || 0,
  });
}

app.get("/", (req, res) => res.send("Backend is running"));

app.post("/api/rooms", (req, res) => {
  const roomId = createRoom();
  res.status(201).json({ roomId });
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId }, callback = () => {}) => {
    if (typeof roomId !== "string" || !rooms.has(roomId)) {
      callback({ ok: false, error: "This room does not exist. Ask the owner for a new invite link." });
      return;
    }

    const previousRoomId = socket.data.roomId;
    if (previousRoomId && previousRoomId !== roomId) {
      socket.leave(previousRoomId);
      emitParticipants(previousRoomId);
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    callback({ ok: true, ...roomPayload(roomId) });
    emitParticipants(roomId);
  });

  socket.on("create-file", ({ roomId, file }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.roomId !== roomId || !file?.name) return;
    if (room.files.some((entry) => entry.name === file.name)) return;

    const newFile = { name: file.name, language: file.language || "plaintext", content: file.content || "" };
    room.files.push(newFile);
    socket.to(roomId).emit("file-created", newFile);
  });

  socket.on("delete-file", ({ roomId, fileName }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.roomId !== roomId || room.files.length <= 1) return;

    const index = room.files.findIndex((file) => file.name === fileName);
    if (index === -1) return;
    room.files.splice(index, 1);
    socket.to(roomId).emit("file-deleted", { fileName });
  });

  socket.on("rename-file", ({ roomId, oldName, newFile }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.roomId !== roomId || !newFile?.name) return;
    const file = room.files.find((entry) => entry.name === oldName);
    if (!file || room.files.some((entry) => entry.name === newFile.name && entry.name !== oldName)) return;

    Object.assign(file, { ...newFile, content: file.content });
    socket.to(roomId).emit("file-renamed", { oldName, newFile: { ...file } });
  });

  socket.on("code-change", ({ roomId, fileName, code }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.roomId !== roomId || typeof code !== "string") return;
    const file = room.files.find((entry) => entry.name === fileName);
    if (!file) return;

    file.content = code;
    socket.to(roomId).emit("code-update", { fileName, code });
  });

  socket.on("disconnecting", () => {
    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
      emitParticipants(socket.data.roomId);
    }
  });
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));
