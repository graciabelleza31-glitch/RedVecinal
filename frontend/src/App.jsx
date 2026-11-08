import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import MiBarrio from './pages/MiBarrio.jsx';
import Guardados from './pages/Guardados.jsx';
import Perfil from './pages/Perfil.jsx';
import Emergencia from './pages/Emergencia.jsx';
import PerfilPublico from './pages/PerfilPublico.jsx';

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AlertBanner />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Públicas: si ya hay sesión, redirigen al Inicio */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
      </Route>

      {/* Protegidas: sin token, redirigen al Login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mi-barrio" element={<MiBarrio />} />
          <Route path="/guardados" element={<Guardados />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/emergencia" element={<Emergencia />} />
          <Route path="/vecino/:id" element={<PerfilPublico />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
