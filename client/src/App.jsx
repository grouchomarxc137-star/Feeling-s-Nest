import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import SessionPage from './pages/SessionPage.jsx';
import BirdFlock from './components/pixel/BirdFlock.jsx';

export default function App() {
  return (
    <>
      <BirdFlock />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/s/:sessionId" element={<SessionPage />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
