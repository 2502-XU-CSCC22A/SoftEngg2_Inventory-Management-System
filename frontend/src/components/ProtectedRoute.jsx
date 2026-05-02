import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProtectedRoute = ({adminOnly=false}) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("http://localhost:3000/auth/me", {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/welcomeuser" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;