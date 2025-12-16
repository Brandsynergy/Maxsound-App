import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AdminUpload from '../components/AdminUpload';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            {/* Tab Buttons */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Manage Tracks
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Upload New Track
            </button>
            <Link
              to="/browse"
              className="ml-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              → View Customer Page
            </Link>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' ? <AdminDashboard /> : <AdminUpload />}
      </div>
    </div>
  );
}
