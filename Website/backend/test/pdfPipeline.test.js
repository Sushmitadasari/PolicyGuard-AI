const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePdfUpload } = require('../src/pdf/pdfValidator');
const { extractPdfText } = require('../src/pdf/pdfExtractor');
const { chunkPdfText } = require('../src/pdf/pdfChunker');

const buildMinimalPdfBuffer = (text) => {
  const header = '%PDF-1.4\n';
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${text.length + 35} >>\nstream\nBT /F1 18 Tf 72 720 Td (${text}) Tj ET\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let body = '';
  let currentOffset = Buffer.byteLength(header);
  const offsets = [0];

  for (const object of objects) {
    offsets.push(currentOffset);
    body += object;
    currentOffset += Buffer.byteLength(object);
  }

  const xrefOffset = Buffer.byteLength(header + body);
  const xref = [
    'xref',
    `0 ${offsets.length}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    '',
  ].join('\n');

  const trailer = [
    'trailer',
    `<< /Size ${offsets.length} /Root 1 0 R >>`,
    'startxref',
    `${xrefOffset}`,
    '%%EOF',
    '',
  ].join('\n');

  return Buffer.from(header + body + xref + trailer, 'utf8');
};

test('validatePdfUpload accepts a PDF-like upload', () => {
  const result = validatePdfUpload({
    originalname: 'policy.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test'),
  });

  assert.equal(result.valid, true);
});

test('extractPdfText reads policy text from a PDF buffer', async () => {
  const buffer = buildMinimalPdfBuffer('We share your personal data with third-party advertisers.');
  const extracted = await extractPdfText(buffer);

  assert.ok(extracted.text.includes('third-party advertisers'));
});

test('chunkPdfText splits long text into multiple chunks', () => {
  const longText = 'A'.repeat(2500);
  const chunks = chunkPdfText(longText);

  assert.ok(chunks.length > 1);
});
