const { sleep } = require('../lib/sleep');
const { RATE_LIMIT_THRESHOLD } = require('../lib/constants');

/**
 * Checks GitHub API rate limit.
 * If remaining calls < 50, pauses until the limit resets.
 * Optionally emits a WebSocket event to the frontend.
 */
async function checkRateLimit(octokit, io = null, jobId = null) {
  try {
    const rateLimit = await octokit.rateLimit.get();
    const remaining = rateLimit.data.rate.remaining;
    const resetTime = rateLimit.data.rate.reset; // Unix timestamp in seconds

    console.log(`GitHub rate limit: ${remaining} calls remaining`);

    if (remaining < RATE_LIMIT_THRESHOLD) {
      const waitMs = (resetTime * 1000) - Date.now() + 5000; // +5s buffer
      const waitSeconds = Math.ceil(waitMs / 1000);

      console.log(`⚠️  Rate limit low. Pausing ${waitSeconds}s until reset.`);

      // Notify frontend if socket is available
      if (io && jobId) {
        io.to(jobId).emit('job:rateLimit', {
          message: `GitHub API rate limit reached. Pausing ingestion and resuming in ${waitSeconds} seconds...`,
          resumeIn: waitSeconds,
        });
      }

      await sleep(waitMs);
      console.log('✅ Rate limit reset. Resuming.');
    }
  } catch (err) {
    // If rate limit check itself fails, log and continue
    console.error('Rate limit check failed:', err.message);
  }
}

module.exports = { checkRateLimit };