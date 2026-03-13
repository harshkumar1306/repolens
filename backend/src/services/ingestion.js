const { createOctokit } = require('../lib/octokit');
const { checkRateLimit } = require('./rateLimit');
const { sleep } = require('../lib/sleep');
const {
  MAX_REPO_FILES,
  MAX_REPO_SIZE_MB,
  MAX_TIER1_FILES,
  MAX_TIER2_FILES,
} = require('../lib/constants');

// ── Noise patterns — files/folders we never want to ingest ──────────────────
const NOISE_PATTERNS = [
  'node_modules', '.git', 'dist', 'build', '.next', 'coverage',
  '__pycache__', '.DS_Store', 'vendor', '.cache', 'tmp',
  '.lock', '.log', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3',
  '.min.js', '.min.css', '.map', '.zip', '.tar', '.gz',
];

function isNoise(filePath) {
  return NOISE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

// ── Tier 1: Most important files (entry points, configs, schemas) ────────────
const TIER1_PATTERNS = [
  /^README/i,
  /^package\.json$/,
  /^requirements\.txt$/,
  /^go\.mod$/,
  /^Cargo\.toml$/,
  /^docker-compose\.yml$/,
  /^Dockerfile$/,
  /^\.env\.example$/,
  /schema\.prisma$/,
  /schema\.sql$/,
  /migrations?\/.*\.sql$/i,
  /^index\.(js|ts)$/,
  /^main\.(py|go|rs)$/,
  /^app\.(js|ts|py)$/,
  /^server\.(js|ts)$/,
];

// ── Tier 2: Important structural files (routes, models, controllers) ─────────
const TIER2_PATTERNS = [
  /routes?\//i,
  /controllers?\//i,
  /models?\//i,
  /api\//i,
  /config\//i,
  /middleware\//i,
  /handlers?\//i,
];

function getTier(filePath) {
  if (TIER1_PATTERNS.some((p) => p.test(filePath))) return 1;
  if (TIER2_PATTERNS.some((p) => p.test(filePath))) return 2;
  return 3;
}

// ── Parse any GitHub URL format into { owner, repo } ────────────────────────
function parseRepoUrl(url) {
  try {
    const cleaned = url.trim().replace(/\.git$/, '');
    const parsed = new URL(cleaned);

    if (parsed.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }

    const parts = parsed.pathname.split('/').filter(Boolean);

    if (parts.length < 2) {
      throw new Error('Could not parse owner/repo from URL');
    }

    return { owner: parts[0], repo: parts[1] };
  } catch (err) {
    throw new Error('Invalid GitHub URL. Please use a URL like https://github.com/owner/repo');
  }
}

// ── Fetch a single file's content with rate limit guard ──────────────────────
async function fetchFileContent(octokit, owner, repo, filePath, io, jobId) {
  await checkRateLimit(octokit, io, jobId);

  try {
    const response = await octokit.repos.getContent({ owner, repo, path: filePath });

    // getContent returns base64-encoded content for files
    if (response.data.content) {
      return Buffer.from(response.data.content, 'base64').toString('utf8');
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch ${filePath}:`, err.message);
    return null;
  }
}

// ── Main ingestion function ──────────────────────────────────────────────────
async function ingestRepo(repoUrl, accessToken, io = null, jobId = null) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const octokit = createOctokit(accessToken);

  function emit(event, data) {
    if (io && jobId) io.to(jobId).emit(event, data);
  }

  // ── LAYER 1: Size check ────────────────────────────────────────────────────
  emit('job:status', { status: 'PROCESSING', message: 'Checking repository size...' });

  let repoMeta;
  try {
    repoMeta = await octokit.repos.get({ owner, repo });
  } catch (err) {
    if (err.status === 404) {
      throw new Error('REPO_NOT_FOUND');
    }
    throw err;
  }

  const sizeKB = repoMeta.data.size;
  const sizeMB = sizeKB / 1024;

  console.log(`Repo size: ${sizeMB.toFixed(1)} MB`);

  if (sizeMB > MAX_REPO_SIZE_MB) {
    throw new Error('REPO_TOO_LARGE');
  }

  // ── LAYER 2: Fetch file tree + filter noise ────────────────────────────────
  emit('job:status', { status: 'PROCESSING', message: 'Fetching file tree...' });

  await checkRateLimit(octokit, io, jobId);

  let treeData;
  try {
    treeData = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: 'true',
    });
  } catch (err) {
    throw new Error('Failed to fetch repository file tree: ' + err.message);
  }

  const allFiles = treeData.data.tree.filter((f) => f.type === 'blob');
  const filtered = allFiles.filter((f) => !isNoise(f.path));

  console.log(`Total files: ${allFiles.length}, After filtering: ${filtered.length}`);

  if (filtered.length > MAX_REPO_FILES) {
    throw new Error('REPO_TOO_LARGE');
  }

  emit('job:status', { status: 'PROCESSING', message: `Filtering files... (${filtered.length} relevant files found)` });

  // ── LAYER 3: Tier ranking ──────────────────────────────────────────────────
  emit('job:status', { status: 'PROCESSING', message: 'Ranking files by importance...' });

  const tier1Files = filtered
    .filter((f) => getTier(f.path) === 1)
    .slice(0, MAX_TIER1_FILES);

  const tier2Files = filtered
    .filter((f) => getTier(f.path) === 2)
    .slice(0, MAX_TIER2_FILES);

  const tier3Paths = filtered
    .filter((f) => getTier(f.path) === 3)
    .map((f) => f.path);

  console.log(`Tier 1: ${tier1Files.length}, Tier 2: ${tier2Files.length}, Tier 3 paths: ${tier3Paths.length}`);

  // ── LAYER 4: Fetch file contents with rate limit guard ────────────────────
  emit('job:status', { status: 'PROCESSING', message: 'Fetching key file contents...' });

  const tier1Contents = {};
  for (let i = 0; i < tier1Files.length; i++) {
    const file = tier1Files[i];
    const content = await fetchFileContent(octokit, owner, repo, file.path, io, jobId);
    if (content) {
      tier1Contents[file.path] = content;
    }

    // Check rate limit every 20 files
    if (i > 0 && i % 20 === 0) {
      await checkRateLimit(octokit, io, jobId);
    }
  }

  const tier2Contents = {};
  for (let i = 0; i < tier2Files.length; i++) {
    const file = tier2Files[i];
    const content = await fetchFileContent(octokit, owner, repo, file.path, io, jobId);
    if (content) {
      tier2Contents[file.path] = content;
    }

    if (i > 0 && i % 20 === 0) {
      await checkRateLimit(octokit, io, jobId);
    }
  }

  emit('job:status', { status: 'PROCESSING', message: 'File ingestion complete. Starting document generation...' });

  // ── Return structured result ───────────────────────────────────────────────
  return {
    owner,
    repo,
    repoName: `${owner}/${repo}`,
    sizeMB: sizeMB.toFixed(1),
    totalFiles: filtered.length,
    tier1: tier1Contents,  // { "path": "content", ... }
    tier2: tier2Contents,
    tier3Paths,            // just paths, no content
  };
}

module.exports = { ingestRepo, parseRepoUrl };