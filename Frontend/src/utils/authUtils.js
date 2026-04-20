/**
 * Authentication Utilities for JobYatra
 */

// Dummy export to prevent syntax errors during migration
export const getToken = () => null;

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const clearAuthData = () => {
  localStorage.removeItem('user');
};
