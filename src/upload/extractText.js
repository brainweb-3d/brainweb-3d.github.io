// Reads the text out of an uploaded lecture file — entirely inside the browser.
// Supports PDF, Word (.docx), PowerPoint (.pptx), and plain text / markdown.

export async function extractText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return readPdf(file);
  if (name.endsWith('.docx')) return readOfficeXml(file, /^word\/document\.xml$/, 'w:t', 'w:p');
  if (name.endsWith('.pptx')) return readOfficeXml(file, /^ppt\/slides\/slide\d+\.xml$/, 'a:t', 'a:p');
  if (/\.(txt|md|text|csv|html?)$/.test(name) || file.type.startsWith('text/')) return file.text();
  throw new Error('Unsupported file type. Please use PDF, DOCX, PPTX or TXT.');
}

async function readPdf(file) {
  // Loaded only when needed, so the rest of the site stays fast
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  const max = Math.min(doc.numPages, 300);
  for (let p = 1; p <= max; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => it.str).join(' '));
  }
  return pages.join('\n');
}

async function readOfficeXml(file, pathPattern, textTag, paraTag) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const paths = Object.keys(zip.files)
    .filter((p) => pathPattern.test(p))
    .sort((a, b) => (parseInt(a.match(/\d+/)?.[0] || 0) - parseInt(b.match(/\d+/)?.[0] || 0)));
  const parser = new DOMParser();
  const out = [];
  for (const p of paths) {
    const xml = parser.parseFromString(await zip.file(p).async('string'), 'application/xml');
    for (const para of xml.getElementsByTagName(paraTag)) {
      const line = [...para.getElementsByTagName(textTag)].map((n) => n.textContent).join('');
      if (line.trim()) out.push(line);
    }
  }
  return out.join('\n');
}
