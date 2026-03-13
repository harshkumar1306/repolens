require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { initSocket } = require('./lib/socket');

// Routes
const authRoutes = require('./routes/auth');

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

// Make io available globally via the socket helper
initSocket(io);

// Also attach to app for use in route handlers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Frontend emits 'join' with a jobId to subscribe to that job's updates
  socket.on('join', ({ jobId }) => {
    socket.join(jobId);
    console.log(`Socket ${socket.id} joined room: ${jobId}`);

    // Confirm to the client that they joined successfully
    socket.emit('joined', { jobId });
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
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// ── Test WebSocket emit endpoint (only used for testing Phase 4) ─────────────
app.post('/test-socket/:jobId', (req, res) => {
  const { jobId } = req.params;
  const io = req.app.get('io');

  io.to(jobId).emit('job:status', {
    status: 'PROCESSING',
    message: 'This is a test WebSocket message from the backend!',
  });

  res.json({ sent: true, jobId });
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RepoLens backend is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'RepoLens API v1.0' });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, async () => {
  console.log(`✅ RepoLens backend running on http://localhost:${PORT}`);

  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});