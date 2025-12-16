import { useState } from 'react';
import axios from 'axios';

export default function AdminUpload() {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    price: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile || !coverFile) {
      alert('Please select both audio and cover image files');
      return;
    }

    setUploading(true);
    setShareUrl('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist', formData.artist);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('audio', audioFile);
      formDataToSend.append('cover', coverFile);

      const response = await axios.post('/api/uploads', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShareUrl(response.data.shareUrl);
      alert('Track uploaded successfully!');
      
      // Reset form
      setFormData({ title: '', artist: '', price: '' });
      setAudioFile(null);
      setCoverFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload New Track</h1>
          <p className="text-gray-600">Fill in the details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Track Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Draw me Closer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artist Name *
            </label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., MEDIAD"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 2.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File (MP3) *
            </label>
            <input
              type="file"
              accept="audio/*"
              required
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {audioFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {coverFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {coverFile.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-200 shadow-lg disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Track'}
          </button>
        </form>

        {shareUrl && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">✓ Upload Successful!</h3>
            <p className="text-sm text-gray-700 mb-3">Share this link with your customers:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
