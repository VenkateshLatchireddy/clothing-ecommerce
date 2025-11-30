// Helper to pick which storage to use for auth (session vs local)
// Default behavior: use sessionStorage in dev to avoid persistent login across tab close.
// If you want to force session or local in production, set VITE_USE_SESSION_AUTH to 'true'.

export const getAuthStorage = () => {
  const forceSession = import.meta.env.VITE_USE_SESSION_AUTH === 'true';
  if (forceSession) return sessionStorage;
  if (import.meta.env.DEV) return sessionStorage;
  // production: default to localStorage to keep persistent login on deployed site
  return localStorage;
};

export const getAuthItem = (key) => getAuthStorage().getItem(key);
export const setAuthItem = (key, value) => getAuthStorage().setItem(key, value);
export const removeAuthItem = (key) => getAuthStorage().removeItem(key);

// For 401 cleanup we may want to remove from both
export const clearAuthStorageBoth = () => {
  try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch {}
  try { sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); } catch {}
};

export default getAuthStorage;
