const Anthropic = require('@anthropic-ai/sdk');
const { sleep } = require('./sleep');
const { CLAUDE_MAX_RETRIES } = require('./constants');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Calls Claude with automatic retry + exponential backoff.
 * If all retries fail, throws the last error.
 */
async function callClaudeWithRetry(prompt, maxRetries = CLAUDE_MAX_RETRIES) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0].text;
    } catch (err) {
      lastError = err;
      console.error(`Claude attempt ${attempt}/${maxRetries} failed:`, err.message);

      if (attempt < maxRetries) {
        const backoff = attempt * 2000; // 2s, 4s, 6s
        console.log(`Retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      }
    }
  }

  throw lastError;
}

module.exports = { callClaudeWithRetry };