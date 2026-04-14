const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    chunks: [
      {
        text: String,
        embedding: [Number],
      },
    ],
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1 });

module.exports = mongoose.model('Note', NoteSchema);
