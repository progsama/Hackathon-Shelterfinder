import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InstagramHomePage from './pages/InstagramHomePage';
import DMPage from './pages/DMPage';
import SettingsPage from './pages/SettingsPage';
import KelownaMapPage from './pages/KelownaMapPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<InstagramHomePage />} />
        <Route path="/dm" element={<DMPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/kelowna-map" element={<KelownaMapPage />} />
      </Routes>
    </Router>
  );
};

export default App;

