import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadStorageData() {
      const storedUser = localStorage.getItem('@EduGuard:user');
      const storedToken = localStorage.getItem('@EduGuard:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      setUser(response.user);
      localStorage.setItem('@EduGuard:user', JSON.stringify(response.user));
      localStorage.setItem('@EduGuard:token', response.token);
      
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  function updateUser(userData) {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('@EduGuard:user', JSON.stringify(updatedUser));
  }

  function logout() {
    localStorage.removeItem('@EduGuard:user');
    localStorage.removeItem('@EduGuard:token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      signed: !!user,
      user,
      loading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
