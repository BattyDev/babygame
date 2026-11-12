import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './Home';
import { Play } from './Play';
import { Watch } from './Watch';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:code/:name?" element={<Watch />} />
        <Route path="/play/:code/:name?" element={<Play />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
