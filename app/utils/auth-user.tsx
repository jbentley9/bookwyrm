/**
 * Utility to get the authenticated user from the session.
 * Returns the user object if authenticated, otherwise returns null.
 */

import { getSession } from "../sessions.server";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export async function getUser(request: Request): Promise<User | null> {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.data.user) {
    return null;
  }
  
  return session.data.user as User;
}

