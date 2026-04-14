import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getFiles, deleteFile, uploadFile } from '../services/api';
import { FiPlus, FiTrash2, FiMessageSquare, FiBook } from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await getFiles();
      setFiles(response.data.files);
      setError('');
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      await uploadFile(file);
      fetchFiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(noteId);
        fetchFiles();
      } catch (err) {
        setError('Failed to delete file');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showLogout={true} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          <label className="flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition bg-blue-50">
            <FiPlus className="text-blue-600 text-2xl" />
            <span className="text-blue-600 font-medium">
              {uploading ? 'Uploading...' : 'Click to upload PDF or DOCX'}
            </span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Files List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Study Materials</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No files uploaded yet</p>
              <p className="text-gray-500">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{file.fileName}</h3>
                    <p className="text-gray-500 text-sm">
                      {(file.fileSize / 1024).toFixed(2)} KB • Uploaded on{' '}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/chat/${file._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FiMessageSquare /> Chat
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
