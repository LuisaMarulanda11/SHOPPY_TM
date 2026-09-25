import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { usuario, loading, esAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-shoppy-muted">
        Cargando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}
