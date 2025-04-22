import { Navigate } from "react-router";

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

