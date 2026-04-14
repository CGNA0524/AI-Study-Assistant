// utils/chunk.js

const chunkText = (text, chunkSize = 1000, overlap = 100) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      if (lastPeriod > start + chunkSize * 0.7) {
        end = lastPeriod + 1;
      }
    }

    chunks.push(text.substring(start, end).trim());
    start = end - overlap;
  }

  return chunks;
};

module.exports = { chunkText };