import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Inicio from "./pages/Inicio";
import Producto from "./pages/Producto";
import Favoritos from "./pages/Favoritos";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import MisPublicaciones from "./pages/MisPublicaciones";
import Publicar from "./pages/Publicar";
import EditarPublicacion from "./pages/EditarPublicacion";
import Mensajes from "./pages/Mensajes";
import PerfilUsuario from "./pages/PerfilUsuario";

function HomeRedirect() {
  const { usuario, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-shoppy-muted">
        Cargando...
      </div>
    );
  }
  return <Navigate to={usuario ? "/inicio" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <Inicio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/producto/:id"
        element={
          <ProtectedRoute>
            <Producto />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favoritos"
        element={
          <ProtectedRoute>
            <Favoritos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editar-perfil"
        element={
          <ProtectedRoute>
            <EditarPerfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-publicaciones"
        element={
          <ProtectedRoute>
            <MisPublicaciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publicar"
        element={
          <ProtectedRoute>
            <Publicar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editar-publicacion/:id"
        element={
          <ProtectedRoute>
            <EditarPublicacion />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mensajes"
        element={
          <ProtectedRoute>
            <Mensajes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuario/:id"
        element={
          <ProtectedRoute>
            <PerfilUsuario />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
