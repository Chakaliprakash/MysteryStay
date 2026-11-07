import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const PRESET_USERS = {
  CUSTOMER: {
    email: 'traveler.alex@mysterystay.com',
    fullName: 'Alex Morgan',
    role: 'ROLE_CUSTOMER',
    phone: '+919876543210'
  },
  HOTEL_MANAGER: {
    email: 'hotel.manager@mysterystay.com',
    fullName: 'Vikramaditya Roy (Taj Partner)',
    role: 'ROLE_HOTEL_MANAGER',
    phone: '+919876543211'
  },
  ADMIN: {
    email: 'admin.lead@mysterystay.com',
    fullName: 'Elena Rostova (Compliance Director)',
    role: 'ROLE_ADMIN',
    phone: '+919876543212'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser() || PRESET_USERS.CUSTOMER);
  const [token, setToken] = useState(() => authService.getToken());
  const [activeRolePreset, setActiveRolePreset] = useState('CUSTOMER');

  useEffect(() => {
    // If no token exists, ensure default customer demo credentials
    if (!token) {
      setUser(PRESET_USERS.CUSTOMER);
    }
  }, [token]);

  const switchRolePreset = async (presetKey) => {
    const target = PRESET_USERS[presetKey];
    if (!target) return;
    setActiveRolePreset(presetKey);

    try {
      // Attempt login against live backend; if credentials match test defaults, token is saved
      const res = await authService.login(target.email, 'Password123!');
      if (res.data?.accessToken) {
        setUser({
          userId: res.data.userId,
          email: res.data.email,
          fullName: res.data.fullName,
          role: res.data.role
        });
        setToken(res.data.accessToken);
        return;
      }
    } catch {
      // Graceful local preset switch for instant UI responsiveness
    }

    setUser(target);
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.data?.accessToken) {
      setUser({
        userId: res.data.userId,
        email: res.data.email,
        fullName: res.data.fullName,
        role: res.data.role
      });
      setToken(res.data.accessToken);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || 'ROLE_CUSTOMER',
        activeRolePreset,
        switchRolePreset,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
