import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrackPage from './pages/TrackPage';
import AdminPage from './pages/AdminPage';
import BrowsePage from './pages/BrowsePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/track/:id" element={<TrackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
