require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Store io instance so other files can use it
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Frontend emits 'join' with a jobId to receive updates for that job
  socket.on('join', ({ jobId }) => {
    socket.join(jobId);
    console.log(`Socket ${socket.id} joined room: ${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── Health check route ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RepoLens backend is running' });
});

// ── Placeholder routes (filled in later phases) ──────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'RepoLens API v1.0' });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
  console.log(`✅ RepoLens backend running on http://localhost:${PORT}`);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});