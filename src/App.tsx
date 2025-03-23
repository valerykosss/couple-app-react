import './App.css';
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter, Route, Routes } from 'react-router';
import LandingPage from "./pages/LandingPage";
import NotFoundPage from './pages/NotFoundPage';
import GeneralPage from './pages/GeneralPage';
import TimetablePage from './pages/TimetablePage';
import AppLayout from './components/layouts/AppLayout';
import useAuthCheck from './hooks/useAuthCheck';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const loading = useAuthCheck();

  if (loading) return <p>Загрузка...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<ProtectedRoute loading={loading} />}>
          <Route path="/app" element={<AppLayout />}>
            <Route path="" element={<GeneralPage />} />
            <Route path="timetable" element={<TimetablePage />} />
          </Route>
        </Route>
          
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
  </BrowserRouter>
  );
}

export default App;
