const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Placeholder — fully built in Phase 8
router.get('/:jobId/pdf', requireAuth, (req, res) => {
  res.status(501).json({ error: 'PDF export coming in Phase 8' });
});

router.get('/:jobId/zip', requireAuth, (req, res) => {
  res.status(501).json({ error: 'ZIP export coming in Phase 8' });
});

module.exports = router;
