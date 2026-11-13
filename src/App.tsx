import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Home } from './Home';
import { Play } from './Play';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:code/:name?" element={<PlayFromWatch />} />
        <Route path="/play/:code/:name?" element={<Play />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

function PlayFromWatch() {
  const { code = '', name } = useParams();
  return <Navigate to={name ? `/play/${code}/${name}` : `/play/${code}`} replace />;
}
