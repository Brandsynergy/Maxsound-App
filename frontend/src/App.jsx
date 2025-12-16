import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackPage from './pages/TrackPage';
import AdminPage from './pages/AdminPage';
import BrowsePage from './pages/BrowsePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/track/:id" element={<TrackPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
