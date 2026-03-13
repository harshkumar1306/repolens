const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { getCachedRepo } = require('../services/cache');
const { parseRepoUrl } = require('../services/ingestion');
const { emitToJob } = require('../lib/socket');

const prisma = new PrismaClient();

// ── POST /api/jobs — Submit a repo URL to generate docs ──────────────────────
router.post('/', requireAuth, async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== 'string') {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  // Validate the URL format and extract owner/repo
  let parsed;
  try {
    parsed = parseRepoUrl(repoUrl);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const repoName = `${parsed.owner}/${parsed.repo}`;
  const normalizedUrl = `https://github.com/${repoName}`;

  try {
    // Get the current user from session
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Create the job record in DB immediately so we have a jobId
    const job = await prisma.job.create({
      data: {
        repoUrl: normalizedUrl,
        repoName,
        status: 'PENDING',
        userId: user.id,
      },
    });

    // Return the jobId to the frontend right away so it can connect via socket
    res.json({ jobId: job.id, repoName });

    // ── Everything below runs after response is sent ─────────────────────────
    // Check cache first
    const cached = await getCachedRepo(normalizedUrl);

    if (cached) {
      // Copy cached documents into this job's documents
      await prisma.document.createMany({
        data: cached.documents.map((doc) => ({
          type: doc.type,
          content: doc.content,
          jobId: job.id,
        })),
      });

      // Mark job as done
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'DONE' },
      });

      // Notify frontend
      emitToJob(job.id, 'job:cached', {
        message: 'Loaded from cache — docs ready instantly!',
        jobId: job.id,
      });

      emitToJob(job.id, 'job:done', { jobId: job.id });

      console.log(`✅ Served ${repoName} from cache for job ${job.id}`);
      return;
    }

    // No cache hit — start full ingestion + generation pipeline
    // This is imported here to avoid circular deps; generation is built in Phase 6
    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'PROCESSING' },
    });

    emitToJob(job.id, 'job:status', {
      status: 'PROCESSING',
      message: 'Starting repository analysis...',
    });

    // Dynamically require to avoid issues before Phase 6 is built
    try {
      const { processJob } = require('../services/generation');
      processJob(job.id, normalizedUrl, user.accessToken);
    } catch (err) {
      // generation.js not built yet — that's fine for this phase
      console.log('Generation service not yet built — will be added in Phase 6');
      emitToJob(job.id, 'job:status', {
        status: 'PROCESSING',
        message: 'Generation pipeline coming in Phase 6...',
      });
    }

  } catch (err) {
    console.error('Job creation error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// ── GET /api/jobs — Get all jobs for current user (history) ──────────────────
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

// ── GET /api/jobs/:id — Get a single job with its documents ──────────────────
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

    // Only allow the owner to see their job
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