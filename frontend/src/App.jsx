import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackPage from './pages/TrackPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/track/:id" element={<TrackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4">MAXSOUND</h1>
              <p className="text-xl mb-8">Premium Audio Experience</p>
              <a 
                href="/admin" 
                className="inline-block bg-white text-purple-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
              >
                Go to Admin
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
