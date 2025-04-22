import { Navigate } from "react-router";

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const user = sessionStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

