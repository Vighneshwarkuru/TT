import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [jwt, setJwt] = useState(() => localStorage.getItem('jwt'));

  const login = (authResponse) => {
    const { jwt: token, refreshToken, userId, role, email, firstName, lastName } = authResponse;
    localStorage.setItem('jwt', token);
    localStorage.setItem('refreshToken', refreshToken);
    const userObj = { id: userId, email, firstName, lastName, role };
    localStorage.setItem('user', JSON.stringify(userObj));
    setJwt(token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.clear();
    setJwt(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, jwt, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
