import './App.css';
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter, Route, Routes } from 'react-router';
import LandingPage from "./pages/LandingPage";
import NotFoundPage from './pages/NotFoundPage';
import GeneralPage from './pages/GeneralPage';
import AppLayout from './components/layouts/AppLayout';
import useAuthCheck from './hooks/useAuthCheck';
import ProtectedRoute from './components/ProtectedRoute';
import { CalendarPage } from './pages/CalendarPage';
import { TinderPage } from './pages/TinderPage';

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
            <Route path="tinder" element={<TinderPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Route>
          
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
  </BrowserRouter>
  );
}

export default App;
