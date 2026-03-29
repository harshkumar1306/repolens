const puppeteer = require('puppeteer');
const archiver  = require('archiver');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DOC_ORDER = [
  'OVERVIEW', 'SPEC', 'ARCHITECTURE', 'TECHSTACK',
  'DATABASE', 'API', 'SETUP', 'DEPLOYMENT',
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
async function getJobDocuments(jobId, userId, selectedTypes = null) {
  const job = await prisma.job.findUnique({
    where:   { id: jobId },
    include: { documents: true },
  });

  if (!job)                      throw new Error('Job not found');
  if (job.userId !== userId)     throw new Error('Access denied');
  if (job.status !== 'DONE')     throw new Error('Job not complete');
  if (!job.documents?.length)    throw new Error('No documents found');

  // Sort in correct order, optionally filter by selectedTypes
  let sorted = [...job.documents].sort(
    (a, b) => DOC_ORDER.indexOf(a.type) - DOC_ORDER.indexOf(b.type)
  );

  if (selectedTypes && selectedTypes.length > 0) {
    sorted = sorted.filter((d) => selectedTypes.includes(d.type));
  }

  if (sorted.length === 0) throw new Error('No matching documents for selected types');

  return { job, documents: sorted };
}

// ── Minimal markdown → HTML converter ────────────────────────────────────────
// Converts the most common markdown patterns so the PDF looks readable
// instead of showing raw markdown syntax.
function markdownToHtml(md) {
  if (!md) return '';

  let html = md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
    // Code blocks (must come before inline code)
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Bullet lists (unordered)
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr>')
    // Line breaks / paragraphs — blank lines become paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Escape any remaining raw < > (outside of our added tags) — skip this
    // to avoid double-escaping the tags we just added above
    ;

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');
  // Wrap in a paragraph if not already a block element
  html = `<p>${html}</p>`;
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return html;
}

// ── Build HTML for PDF rendering ─────────────────────────────────────────────
function buildPdfHtml(job, documents) {
  const docSections = documents.map((doc) => {
    const label = DOC_LABELS[doc.type] || doc.type;
    const body  = markdownToHtml(doc.content);
    return `
      <div class="doc-section">
        <div class="doc-header">
          <h1 class="doc-title">${label}</h1>
          <div class="doc-divider"></div>
        </div>
        <div class="doc-body">${body}</div>
      </div>
    `;
  }).join('<div class="page-break"></div>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${job.repoName} — RepoLens Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: white;
    }

    /* ── Cover ── */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 60px;
      text-align: center;
      background: linear-gradient(135deg, #1a1a18 0%, #111110 100%);
      color: white;
    }
    .cover-logo {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #E45B11, #F8AB0B);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      margin-bottom: 28px;
    }
    .cover-badge {
      display: inline-block;
      background: rgba(228,91,17,0.2);
      color: #F4860D;
      border: 1px solid rgba(228,91,17,0.4);
      padding: 5px 14px; border-radius: 20px;
      font-size: 11px; letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
      font-family: 'Courier New', monospace;
    }
    .cover-title { font-size: 38px; font-weight: 700; margin-bottom: 10px; }
    .cover-repo  {
      font-size: 17px; color: #888; margin-bottom: 28px;
      font-family: 'Courier New', monospace;
    }
    .cover-meta  { font-size: 12px; color: #555; }

    /* ── TOC ── */
    .toc { padding: 60px; }
    .toc h2 {
      font-size: 22px; font-weight: 700; color: #1e1e1c;
      margin-bottom: 24px; padding-bottom: 12px;
      border-bottom: 2px solid #e8e8e6;
    }
    .toc-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px dotted #e8e8e6;
      font-size: 14px; color: #333;
    }
    .toc-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; background: #f4f4f2;
      border-radius: 50%; font-size: 10px; font-weight: 700;
      color: #888; margin-right: 12px; flex-shrink: 0;
    }

    /* ── Doc sections ── */
    .doc-section { padding: 50px 60px; }
    .doc-header  { margin-bottom: 24px; }
    .doc-title   { font-size: 26px; font-weight: 700; color: #1a1a18; margin-bottom: 10px; }
    .doc-divider {
      height: 3px;
      background: linear-gradient(90deg, #E45B11, #F8AB0B, transparent);
      border-radius: 2px;
    }

    /* ── Doc body typography ── */
    .doc-body { line-height: 1.75; color: #2c2c2a; }
    .doc-body h1 { font-size: 20px; font-weight: 700; margin: 28px 0 10px; color: #1a1a18; }
    .doc-body h2 { font-size: 17px; font-weight: 700; margin: 22px 0 8px;  color: #1a1a18; }
    .doc-body h3 { font-size: 14px; font-weight: 700; margin: 18px 0 6px;  color: #333; }
    .doc-body h4 { font-size: 13px; font-weight: 600; margin: 14px 0 4px;  color: #444; }
    .doc-body p  { margin: 0 0 12px; }
    .doc-body ul, .doc-body ol {
      margin: 8px 0 12px 24px; padding: 0;
    }
    .doc-body li { margin-bottom: 4px; }
    .doc-body pre {
      background: #f4f4f2; border: 1px solid #e2e2e0;
      border-radius: 8px; padding: 16px 20px;
      font-family: 'Courier New', monospace;
      font-size: 10.5px; line-height: 1.65;
      white-space: pre-wrap; word-break: break-word;
      margin: 12px 0; overflow-x: auto;
    }
    .doc-body code {
      font-family: 'Courier New', monospace; font-size: 10.5px;
      background: #f0f0ee; border: 1px solid #e2e2e0;
      border-radius: 4px; padding: 2px 5px;
    }
    .doc-body pre code {
      background: none; border: none; padding: 0;
    }
    .doc-body blockquote {
      border-left: 3px solid #E45B11;
      padding: 8px 16px; margin: 12px 0;
      background: #fdf9f6; color: #555;
      font-style: italic;
    }
    .doc-body strong { font-weight: 700; color: #111; }
    .doc-body em     { font-style: italic; }
    .doc-body hr     { border: none; border-top: 1px solid #e2e2e0; margin: 20px 0; }
    .doc-body a      { color: #E45B11; text-decoration: none; }
    .doc-body table  { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 11px; }
    .doc-body th, .doc-body td {
      border: 1px solid #e2e2e0; padding: 7px 10px; text-align: left;
    }
    .doc-body th     { background: #f4f4f2; font-weight: 600; }

    /* ── Page breaks ── */
    .page-break { page-break-after: always; break-after: page; }

    @page { margin: 0; size: A4; }
  </style>
</head>
<body>

  <!-- Cover -->
  <div class="cover">
    <div class="cover-logo">🔍</div>
    <div class="cover-badge">Generated by RepoLens</div>
    <div class="cover-title">Documentation</div>
    <div class="cover-repo">${job.repoName}</div>
    <div class="cover-meta">
      ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      &nbsp;·&nbsp;
      ${documents.length} document${documents.length !== 1 ? 's' : ''}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- TOC -->
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

  ${docSections}

</body>
</html>`;
}

// ── Generate PDF using Puppeteer ─────────────────────────────────────────────
// FIX: headless:'new' was the primary failure cause on Render Linux containers.
//      headless:true is the correct value for puppeteer <21 / any environment.
//      Added --no-zygote and --disable-gpu which are required in most CI/cloud envs.
async function generatePdf(jobId, userId, selectedTypes = null) {
  const { job, documents } = await getJobDocuments(jobId, userId, selectedTypes);
  const html = buildPdfHtml(job, documents);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,   // ← FIX: was 'new', which breaks on Render.com
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',  // use /tmp instead of /dev/shm (crucial for free tier)
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',              // ← needed in containerised envs
        '--disable-gpu',            // ← needed when there's no display
        '--disable-extensions',
        '--disable-background-networking',
        '--single-process',         // ← helps on low-memory free-tier containers
      ],
    });

    const page = await browser.newPage();

    // Set viewport to A4 width (794px) so layout matches print dimensions
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.setContent(html, {
      waitUntil: 'domcontentloaded', // 'networkidle0' times out on Render free tier with no outbound network
      timeout: 30000,
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    return {
      pdf,
      filename: `${job.repoName.replace('/', '-')}-docs.pdf`,
    };

  } catch (err) {
    console.error('Puppeteer error:', err.message);
    // Re-throw with a cleaner message for the route handler
    throw new Error(`PDF generation failed: ${err.message}`);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
  }
}

// ── Generate ZIP of markdown files ──────────────────────────────────────────
async function generateZip(jobId, userId, res) {
  const { job, documents } = await getJobDocuments(jobId, userId);
  const folderName = job.repoName.replace('/', '-');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${folderName}-docs.zip"`
  );

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);

  documents.forEach((doc, i) => {
    const label    = DOC_LABELS[doc.type] || doc.type;
    const filename = `${String(i + 1).padStart(2, '0')}-${doc.type.toLowerCase()}.md`;
    const content  = `# ${label}\n\n> Generated by RepoLens for \`${job.repoName}\`\n\n---\n\n${doc.content}`;
    archive.append(content, { name: `${folderName}/${filename}` });
  });

  // README index
  const readme = `# ${job.repoName} — RepoLens Documentation

Generated on ${new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })}

## Documents

${documents.map((doc, i) => {
  const label    = DOC_LABELS[doc.type] || doc.type;
  const filename = `${String(i + 1).padStart(2, '0')}-${doc.type.toLowerCase()}.md`;
  return `${i + 1}. [${label}](./${filename})`;
}).join('\n')}

---
*Generated by [RepoLens](https://repolens-kappa.vercel.app)*
`;
  archive.append(readme, { name: `${folderName}/README.md` });

  await archive.finalize();
}

module.exports = { generatePdf, generateZip };
