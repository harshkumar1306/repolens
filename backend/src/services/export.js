const puppeteer = require('puppeteer');
const archiver = require('archiver');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DOC_ORDER = [
  'OVERVIEW',
  'SPEC',
  'ARCHITECTURE',
  'TECHSTACK',
  'DATABASE',
  'API',
  'SETUP',
  'DEPLOYMENT',
];

const DOC_LABELS = {
  OVERVIEW:     'Project Overview',
  SPEC:         'Reverse Engineer Spec',
  ARCHITECTURE: 'System Architecture',
  TECHSTACK:    'Tech Stack Breakdown',
  DATABASE:     'Database Schema',
  API:          'API Reference',
  SETUP:        'Developer Setup Guide',
  DEPLOYMENT:   'Deployment Guide',
};

// ── Fetch and validate job + documents ───────────────────────────────────────
async function getJobDocuments(jobId, userId) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { documents: true },
  });

  if (!job) throw new Error('Job not found');
  if (job.userId !== userId) throw new Error('Access denied');
  if (job.status !== 'DONE') throw new Error('Job not complete');
  if (!job.documents?.length) throw new Error('No documents found');

  // Sort documents in correct order
  const sorted = [...job.documents].sort((a, b) => {
    return DOC_ORDER.indexOf(a.type) - DOC_ORDER.indexOf(b.type);
  });

  return { job, documents: sorted };
}

// ── Build the HTML string for PDF rendering ──────────────────────────────────
function buildPdfHtml(job, documents) {
  // Convert markdown to basic HTML for each doc
  // We use a simple approach — render as preformatted text with styling
  // This avoids needing a server-side markdown parser
  const docSections = documents.map((doc) => {
    const label = DOC_LABELS[doc.type] || doc.type;
    // Escape HTML special chars in content
    const escaped = doc.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `
      <div class="doc-section">
        <div class="doc-header">
          <h1 class="doc-title">${label}</h1>
          <div class="doc-divider"></div>
        </div>
        <pre class="doc-content">${escaped}</pre>
      </div>
    `;
  }).join('<div class="page-break"></div>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${job.repoName} — RepoLens Documentation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12px;
          color: #1a1a1a;
          background: white;
          padding: 0;
        }

        /* Cover page */
        .cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 60px;
          text-align: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
        }
        .cover-icon { font-size: 64px; margin-bottom: 24px; }
        .cover-title { font-size: 36px; font-weight: 700; margin-bottom: 8px; }
        .cover-repo {
          font-size: 18px;
          color: #94a3b8;
          font-family: 'Courier New', monospace;
          margin-bottom: 32px;
        }
        .cover-meta { font-size: 13px; color: #64748b; }
        .cover-badge {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          margin-bottom: 24px;
        }

        /* Table of contents */
        .toc {
          padding: 60px;
          min-height: 40vh;
        }
        .toc h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }
        .toc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px dotted #e2e8f0;
          font-size: 14px;
          color: #334155;
        }
        .toc-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #f1f5f9;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-right: 12px;
          flex-shrink: 0;
        }

        /* Doc sections */
        .doc-section {
          padding: 50px 60px;
        }
        .doc-header { margin-bottom: 24px; }
        .doc-title {
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .doc-divider {
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, transparent);
          border-radius: 2px;
        }
        .doc-content {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          line-height: 1.7;
          color: #374151;
          white-space: pre-wrap;
          word-break: break-word;
          background: #f8fafc;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        /* Page break between sections */
        .page-break {
          page-break-after: always;
          break-after: page;
        }

        /* Footer */
        @page {
          margin: 0;
          size: A4;
        }
      </style>
    </head>
    <body>

      <!-- Cover page -->
      <div class="cover">
        <div class="cover-icon">🔍</div>
        <div class="cover-badge">Generated by RepoLens</div>
        <div class="cover-title">Documentation</div>
        <div class="cover-repo">${job.repoName}</div>
        <div class="cover-meta">
          Generated on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
          &nbsp;·&nbsp;
          ${documents.length} documents
        </div>
      </div>

      <div class="page-break"></div>

      <!-- Table of contents -->
      <div class="toc">
        <h2>Table of Contents</h2>
        ${documents.map((doc, i) => `
          <div class="toc-item">
            <div style="display:flex;align-items:center;">
              <span class="toc-num">${i + 1}</span>
              ${DOC_LABELS[doc.type] || doc.type}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="page-break"></div>

      <!-- Document sections -->
      ${docSections}

    </body>
    </html>
  `;
}

// ── Generate PDF using Puppeteer ─────────────────────────────────────────────
async function generatePdf(jobId, userId) {
  const { job, documents } = await getJobDocuments(jobId, userId);

  const html = buildPdfHtml(job, documents);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return { pdf, filename: `${job.repoName.replace('/', '-')}-docs.pdf` };
  } finally {
    if (browser) await browser.close();
  }
}

// ── Generate ZIP of markdown files ──────────────────────────────────────────
async function generateZip(jobId, userId, res) {
  const { job, documents } = await getJobDocuments(jobId, userId);

  const folderName = job.repoName.replace('/', '-');

  // Set response headers before streaming
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${folderName}-docs.zip"`
  );

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw err;
  });

  // Pipe archive directly to response stream
  archive.pipe(res);

  // Add each document as a .md file
  documents.forEach((doc, i) => {
    const label = DOC_LABELS[doc.type] || doc.type;
    const filename = `${String(i + 1).padStart(2, '0')}-${doc.type.toLowerCase()}.md`;

    // Add a header to each file
    const content = `# ${label}\n\n> Generated by RepoLens for \`${job.repoName}\`\n\n---\n\n${doc.content}`;
    archive.append(content, { name: `${folderName}/${filename}` });
  });

  // Add a README index file
  const readmeContent = `# ${job.repoName} — RepoLens Documentation

Generated on ${new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })}

## Documents

${documents.map((doc, i) => {
  const label = DOC_LABELS[doc.type] || doc.type;
  const filename = `${String(i + 1).padStart(2, '0')}-${doc.type.toLowerCase()}.md`;
  return `${i + 1}. [${label}](./${filename})`;
}).join('\n')}

---
*Generated by [RepoLens](https://github.com/your-repo)*
`;

  archive.append(readmeContent, { name: `${folderName}/README.md` });

  await archive.finalize();
}

module.exports = { generatePdf, generateZip };