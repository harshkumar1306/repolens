const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { generatePdf, generateZip } = require('../services/export');

// ── GET /api/export/:jobId/pdf ───────────────────────────────────────────────
router.get('/:jobId/pdf', requireAuth, async (req, res) => {
  try {
    console.log(`Generating PDF for job ${req.params.jobId}...`);

    const { pdf, filename } = await generatePdf(
      req.params.jobId,
      req.session.userId
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);

    console.log(`✅ PDF generated: ${filename} (${(pdf.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error('PDF export error:', err.message);

    const status =
      err.message === 'Job not found' ? 404 :
      err.message === 'Access denied' ? 403 :
      err.message === 'Job not complete' ? 400 : 500;

    res.status(status).json({ error: err.message });
  }
});

// ── GET /api/export/:jobId/zip ───────────────────────────────────────────────
router.get('/:jobId/zip', requireAuth, async (req, res) => {
  try {
    console.log(`Generating ZIP for job ${req.params.jobId}...`);

    await generateZip(req.params.jobId, req.session.userId, res);

    console.log(`✅ ZIP generated for job ${req.params.jobId}`);
  } catch (err) {
    console.error('ZIP export error:', err.message);

    if (!res.headersSent) {
      const status =
        err.message === 'Job not found' ? 404 :
        err.message === 'Access denied' ? 403 :
        err.message === 'Job not complete' ? 400 : 500;

      res.status(status).json({ error: err.message });
    }
  }
});

module.exports = router;