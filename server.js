const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const userSockets = new Map(); // userId -> Set of socketIds
const socketUsers = new Map(); // socketId -> userId

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected: ${socket.id}`);

    // Track user's sockets
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketUsers.set(socket.id, userId);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Broadcast online status
    io.emit("user:status", { userId, isOnline: true });

    // Join conversation rooms
    socket.on("join:conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle new message
    socket.on("message:send", (data) => {
      const { conversationId, message } = data;
      socket.to(`conversation:${conversationId}`).emit("message:new", message);
    });

    // Handle typing
    socket.on("typing:start", ({ conversationId, userName }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        userId,
        userName,
        conversationId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        userId,
        conversationId,
      });
    });

    // Handle message read
    socket.on("message:read", ({ conversationId, messageIds }) => {
      socket.to(`conversation:${conversationId}`).emit("message:read", {
        userId,
        messageIds,
        conversationId,
      });
    });

    // Handle message delete
    socket.on("message:delete", ({ conversationId, messageId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        io.to(`conversation:${conversationId}`).emit("message:deleted", {
          messageId,
          conversationId,
        });
      }
    });

    // Handle reaction
    socket.on("message:react", ({ conversationId, messageId, emoji }) => {
      io.to(`conversation:${conversationId}`).emit("message:reacted", {
        messageId,
        emoji,
        userId,
        conversationId,
      });
    });

    // Handle call signaling
    socket.on("call:initiate", ({ targetUserId, callType, offer }) => {
      io.to(`user:${targetUserId}`).emit("call:incoming", {
        callerId: userId,
        callType,
        offer,
      });
    });

    socket.on("call:answer", ({ callerId, answer }) => {
      io.to(`user:${callerId}`).emit("call:answered", { answer });
    });

    socket.on("call:ice-candidate", ({ targetUserId, candidate }) => {
      io.to(`user:${targetUserId}`).emit("call:ice-candidate", { candidate, userId });
    });

    socket.on("call:end", ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit("call:ended", { userId });
    });

    socket.on("call:reject", ({ callerId }) => {
      io.to(`user:${callerId}`).emit("call:rejected", { userId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected: ${socket.id}`);
      socketUsers.delete(socket.id);

      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          io.emit("user:status", { userId, isOnline: false, lastSeen: new Date() });
        }
      }
    });
  });

  global.io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
