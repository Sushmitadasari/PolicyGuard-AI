import api from "./api";

/**
 * Upload PDF file for analysis
 * @param {File} pdfFile - The PDF file to upload
 * @returns {Promise} - Backend response with analysis data
 */
export const uploadPDF = (pdfFile) => {
  const formData = new FormData();
  formData.append("pdf", pdfFile);

  return api.post("/pdf/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
