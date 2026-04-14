const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

const { uploadFile, getFiles, deleteFile } = require('../controllers/fileController');

// Upload file
router.post('/upload', auth, upload.single('file'), uploadFile);

// Get all files for user
router.get('/files', auth, getFiles);

// Delete file
router.delete('/files/:noteId', auth, deleteFile);

module.exports = router;