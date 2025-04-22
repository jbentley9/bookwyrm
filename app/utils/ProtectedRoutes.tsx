import { Navigate } from "react-router";
import { getSession } from "../sessions.server";

export default async function ProtectedRoutes({ 
  children,
  request 
}: { 
  children: React.ReactNode;
  request: Request;
}) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.data.user;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

