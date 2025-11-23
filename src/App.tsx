import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InstagramHomePage from './pages/InstagramHomePage';
import DMPage from './pages/DMPage';
import SettingsPage from './pages/SettingsPage';
import MapPage from './pages/MapPage';
import ReservationPage from './pages/ReservationPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<InstagramHomePage />} />
        <Route path="/dm" element={<DMPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/kelowna-map" element={<MapPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
      </Routes>
    </Router>
  );
};

export default App;

