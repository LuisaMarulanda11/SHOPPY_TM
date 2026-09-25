import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/auth/me")
      .then((data) => setUsuario(data.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      loading,
      esAdmin: usuario?.rol === "admin",
      setUsuario,
      async logout() {
        try {
          await apiPost("/auth/logout", {});
        } catch {
          /* ignore */
        }
        setUsuario(null);
      },
    }),
    [usuario, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
