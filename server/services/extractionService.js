/**
 * File extraction service.
 * Handles text extraction from PDF (pdf-parse) and DOCX (mammoth) files.
 */

const path = require('path');
const fs = require('fs');

/**
 * Extracts text from a PDF file using pdf-parse.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} Extracted plain text
 */
async function extractFromPDF(filePath) {
  // pdf-parse is imported inline to avoid test-runner issues
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || '';
}

/**
 * Extracts text from a DOCX file using mammoth.
 * @param {string} filePath - Absolute path to the DOCX file
 * @returns {Promise<string>} Extracted plain text
 */
async function extractFromDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

/**
 * Main extraction function that dispatches to PDF or DOCX extractor
 * based on file extension.
 * @param {string} filePath - Absolute path to the resume file
 * @param {string} mimetype - MIME type of the uploaded file
 * @returns {Promise<string>} Extracted plain text
 */
async function extractTextFromFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimetype === 'application/pdf') {
    return await extractFromPDF(filePath);
  } else if (
    ext === '.docx' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await extractFromDOCX(filePath);
  } else if (ext === '.doc' || mimetype === 'application/msword') {
    // doc fallback — attempt mammoth anyway (may partially work)
    try {
      return await extractFromDOCX(filePath);
    } catch {
      throw new Error('Legacy .doc format is not fully supported. Please convert to .docx or .pdf');
    }
  } else if (ext === '.txt' || mimetype === 'text/plain') {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`Unsupported file type: ${ext}. Please upload a PDF or DOCX file.`);
  }
}

module.exports = { extractTextFromFile };
