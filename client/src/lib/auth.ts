export interface User {
  id: string;
  name: string;
  email: string;
}
 
export const tokenStorage = {
  getAccess: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  },
 
  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
  },
 
  set: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  },
 
  clear: () => {
    if (typeof window === 'undefined') return;
    ['accessToken', 'refreshToken'].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
 
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.sub || payload.id,
        email: payload.email || '',
        name: payload.name || payload.email || '',
      };
    } catch {
      return null;
    }
  },
};