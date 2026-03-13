const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { getCachedRepo } = require('../services/cache');
const { parseRepoUrl } = require('../services/ingestion');
const { processJob } = require('../services/generation');
const { emitToJob } = require('../lib/socket');

const prisma = new PrismaClient();

// ── POST /api/jobs ───────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== 'string') {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  let parsed;
  try {
    parsed = parseRepoUrl(repoUrl);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const repoName = `${parsed.owner}/${parsed.repo}`;
  const normalizedUrl = `https://github.com/${repoName}`;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Create job record
    const job = await prisma.job.create({
      data: {
        repoUrl: normalizedUrl,
        repoName,
        status: 'PENDING',
        userId: user.id,
      },
    });

    // Respond immediately with jobId so frontend can connect via socket
    res.json({ jobId: job.id, repoName });

    // ── Check cache ──────────────────────────────────────────────────────────
    const cached = await getCachedRepo(normalizedUrl);

    if (cached) {
      await prisma.document.createMany({
        data: cached.documents.map((doc) => ({
          type: doc.type,
          content: doc.content,
          jobId: job.id,
        })),
      });

      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'DONE' },
      });

      emitToJob(job.id, 'job:cached', {
        message: 'Loaded from cache — docs ready instantly!',
        jobId: job.id,
      });

      emitToJob(job.id, 'job:done', { jobId: job.id });

      console.log(`⚡ Served ${repoName} from cache`);
      return;
    }

    // ── No cache — run full pipeline ─────────────────────────────────────────
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'PROCESSING' },
    });

    emitToJob(job.id, 'job:status', {
      status: 'PROCESSING',
      message: 'Starting repository analysis...',
    });

    // Fire and forget — runs async, emits progress via WebSocket
    processJob(job.id, normalizedUrl, user.accessToken);

  } catch (err) {
    console.error('Job creation error:', err);
    // Only send error if headers not sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create job' });
    }
  }
});

// ── GET /api/jobs ────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        repoUrl: true,
        repoName: true,
        status: true,
        createdAt: true,
        error: true,
        _count: { select: { documents: true } },
      },
    });

    res.json({ jobs });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ── GET /api/jobs/:id ────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ job });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;