import { getSession } from "../sessions.server";

export async function getUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return null;
  }
  
  return session.data.user;
}

