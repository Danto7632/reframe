import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ThoughtRecords from './pages/ThoughtRecords';
import ThoughtRecordNew from './pages/ThoughtRecordNew';
import ThoughtRecordDetail from './pages/ThoughtRecordDetail';
import ReframeCards from './pages/ReframeCards';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="thought-records" element={<ThoughtRecords />} />
        <Route path="thought-records/new" element={<ThoughtRecordNew />} />
        <Route path="thought-records/:id" element={<ThoughtRecordDetail />} />
        <Route path="reframe-cards" element={<ReframeCards />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}
