import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DMPage from './pages/DMPage';
import SettingsPage from './pages/SettingsPage';
import KelownaMapPage from './pages/KelownaMapPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dm" replace />} />
        <Route path="/dm" element={<DMPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/kelowna-map" element={<KelownaMapPage />} />
      </Routes>
    </Router>
  );
};

export default App;

