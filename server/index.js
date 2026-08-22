/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Y = require("yjs");
const { fromNodeHeaders, toNodeHandler } = require("better-auth/node");
const { auth } = require("./auth");
const { prisma } = require("./db");

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const rooms = new Map();

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"], credentials: true },
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

function createRoomDocument(roomId) {
  const doc = new Y.Doc();
  const files = doc.getMap("files");
  starterFiles.forEach((file) => {
    const yFile = new Y.Map();
    yFile.set("language", file.language);
    yFile.set("content", new Y.Text(file.content));
    files.set(file.name, yFile);
  });
  rooms.set(roomId, { doc });
}

function roomPayload(roomId) {
  const room = rooms.get(roomId);
  return {
    roomId,
    yjsUpdate: Y.encodeStateAsUpdate(room.doc),
    participants: roomParticipants(roomId),
  };
}

function roomParticipants(roomId) {
  const socketIds = io.sockets.adapter.rooms.get(roomId) || new Set();
  return [...socketIds].map((socketId) => {
    const participant = io.sockets.sockets.get(socketId);
    return { id: socketId, name: participant?.data.displayName || "Anonymous" };
  });
}

function emitParticipants(roomId) {
  io.to(roomId).emit("participants-updated", {
    participants: roomParticipants(roomId),
  });
}

app.get("/", (req, res) => res.send("Backend is running"));

app.post("/api/rooms", async (req, res) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: "Sign in to create a room." });

  const roomId = crypto.randomUUID();
  await prisma.room.create({ data: { id: roomId, memberships: { create: { userId: session.user.id } } } });
  createRoomDocument(roomId);
  return res.status(201).json({ roomId });
});

io.use(async (socket, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(socket.handshake.headers) });
    if (!session) return next(new Error("Sign in to join a room."));
    socket.data.user = session.user;
    return next();
  } catch {
    return next(new Error("Could not validate your session."));
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", async ({ roomId }, callback = () => {}) => {
    if (typeof roomId !== "string") {
      callback({ ok: false, error: "This room does not exist. Ask the owner for a new invite link." });
      return;
    }
    const persistedRoom = await prisma.room.findUnique({ where: { id: roomId } });
    if (!persistedRoom) {
      callback({ ok: false, error: "This room does not exist. Ask the owner for a new invite link." });
      return;
    }
    if (!rooms.has(roomId)) createRoomDocument(roomId);
    const currentRoom = io.sockets.adapter.rooms.get(roomId);
    if (!socket.data.roomId && currentRoom?.size >= 5) {
      callback({ ok: false, error: "This room is full. Rooms can have up to 5 people." });
      return;
    }

    const previousRoomId = socket.data.roomId;
    if (previousRoomId && previousRoomId !== roomId) {
      socket.leave(previousRoomId);
      emitParticipants(previousRoomId);
    }

    socket.data.displayName = socket.data.user.name;
    socket.join(roomId);
    socket.data.roomId = roomId;
    await prisma.roomMember.upsert({
      where: { roomId_userId: { roomId, userId: socket.data.user.id } },
      update: { joinedAt: new Date() },
      create: { roomId, userId: socket.data.user.id },
    });
    callback({ ok: true, ...roomPayload(roomId) });
    emitParticipants(roomId);
  });

  socket.on("yjs-update", ({ roomId, update }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.roomId !== roomId || !update) return;
    try {
      Y.applyUpdate(room.doc, new Uint8Array(update));
      socket.to(roomId).emit("yjs-update", update);
    } catch {
      // Ignore malformed updates from an untrusted client.
    }
  });

  socket.on("disconnecting", () => {
    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
      emitParticipants(socket.data.roomId);
    }
  });
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));
