const fs = require('fs');
const Note = require('../models/Note');
const { chunkText } = require('../utils/chunk');
const { extractTextFromFile } = require('../utils/textExtraction');

exports.uploadFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract text based on file type
    const text = await extractTextFromFile(filePath, mimeType);

    const chunks = chunkText(text);

    const note = await Note.create({
      userId: req.userId,
      fileName: req.file.originalname,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      content: text,
      chunks: chunks.map((c) => ({ text: c })),
    });

    res.json({
      message: 'File uploaded successfully',
      note,
    });

  } catch (error) {
    res.status(500).json({
      message: `Error uploading file: ${error.message}`,
    });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await Note.find({ userId: req.userId }).select('_id fileName originalFileName fileSize uploadedAt');
    res.json({ files });
  } catch (error) {
    res.status(500).json({
      message: `Error fetching files: ${error.message}`,
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { noteId } = req.params;
    await Note.findByIdAndDelete(noteId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: `Error deleting file: ${error.message}`,
    });
  }
};