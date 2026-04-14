const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    throw new Error(`Error extracting PDF text: ${error.message}`);
  }
};

const extractTextFromTxt = async (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Error extracting TXT text: ${error.message}`);
  }
};

const extractTextFromDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Error extracting DOCX text: ${error.message}`);
  }
};

const extractTextFromFile = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDocx(filePath);
  } else if (mimeType === 'text/plain') {
    return await extractTextFromTxt(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
};

module.exports = {
  extractTextFromPDF,
  extractTextFromDocx,
  extractTextFromTxt,
  extractTextFromFile,
};
