const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const pdfUploadFields = upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

const resolveUploadedPdf = (req) => {
  if (req?.file) {
    return req.file;
  }

  const fromFields = req?.files?.pdf?.[0] || req?.files?.file?.[0] || null;
  if (fromFields) {
    req.file = fromFields;
  }

  return req.file || null;
};

module.exports = {
  upload,
  pdfUploadFields,
  resolveUploadedPdf,
};