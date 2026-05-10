const VALID_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
]);

const isPdfFile = (file) => {
  if (!file || typeof file !== 'object') {
    return false;
  }

  const fileName = typeof file.originalname === 'string' ? file.originalname.toLowerCase() : '';
  const mimeType = typeof file.mimetype === 'string' ? file.mimetype.toLowerCase() : '';

  return VALID_MIME_TYPES.has(mimeType) || fileName.endsWith('.pdf');
};

const validatePdfUpload = (file) => {
  if (!file) {
    return { valid: false, message: 'No PDF file uploaded' };
  }

  if (!isPdfFile(file)) {
    return { valid: false, message: 'Uploaded file must be a PDF' };
  }

  if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
    return { valid: false, message: 'PDF buffer is missing or invalid' };
  }

  return { valid: true, message: '' };
};

const getSafePdfName = (file) => {
  if (!file || typeof file.originalname !== 'string') {
    return 'uploaded.pdf';
  }

  return file.originalname.trim() || 'uploaded.pdf';
};

module.exports = {
  isPdfFile,
  validatePdfUpload,
  getSafePdfName,
};
