const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { createOctokit } = require('../lib/octokit');

const prisma = new PrismaClient();

// ── Step 1: Redirect user to GitHub login ────────────────────────────────────
// GET /auth/github
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${req.protocol}://${req.get('host')}/auth/github/callback`,
    scope: 'read:user',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// ── Step 2: GitHub redirects back here with a code ──────────────────────────
// GET /auth/github/callback
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData.error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
    }

    const accessToken = tokenData.access_token;

    // Fetch user info from GitHub
    const octokit = createOctokit(accessToken);
    const { data: githubUser } = await octokit.users.getAuthenticated();

    // Upsert user in database (create if new, update if existing)
    const user = await prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      update: {
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken,
      },
      create: {
        githubId: String(githubUser.id),
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken,
      },
    });

    // Save user ID to session
    req.session.userId = user.id;
    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/`);
    });

  } catch (err) {
    console.error('Auth callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// ── Return current logged-in user ────────────────────────────────────────────
// GET /auth/me
router.get('/me', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ user: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ user: null });
    }

    res.json({ user });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Logout ───────────────────────────────────────────────────────────────────
// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;