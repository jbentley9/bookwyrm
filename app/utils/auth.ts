/**
 * Authentication utilities for the application.
 * Handles user authentication and session management.
 * Passwords are plaintext in the database. In Productio I would use bcrypt for password hashing 
 * and JWT for session tokens.
 */
import prisma from '../db';

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // For now, we'll just compare passwords directly
  // In production, I would use bcrypt or preferred hash function
  if (user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin
  };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true
    },
  });
}