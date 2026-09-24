import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthTokens } from '../types';
import { INITIAL_USERS } from '../services/mockData';
import apiClient from '../services/api';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  login: (emailOrUsername: string, password?: string, roleOverride?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(
    localStorage.getItem('sukulu_api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  );

  const setApiBaseUrl = (url: string) => {
    localStorage.setItem('sukulu_api_url', url);
    setApiBaseUrlState(url);
    apiClient.defaults.baseURL = url;
  };

  useEffect(() => {
    // Check saved tokens and user session in localStorage
    const savedAccessToken = localStorage.getItem('sukulu_access_token');
    const savedRefreshToken = localStorage.getItem('sukulu_refresh_token');
    const savedUserJson = localStorage.getItem('sukulu_user');

    if (savedAccessToken && savedRefreshToken && savedUserJson) {
      try {
        const parsedUser = JSON.parse(savedUserJson);
        setUser(parsedUser);
        setTokens({ access: savedAccessToken, refresh: savedRefreshToken });
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('sukulu_access_token');
        localStorage.removeItem('sukulu_refresh_token');
        localStorage.removeItem('sukulu_user');
      }
    } else {
      // Default initial mock login as Admin for instant rich preview
      const defaultUser = INITIAL_USERS[0];
      const mockAccess = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQURNSU4iLCJleHAiOjE3Nzk5Mzg3NjV9.mock_signature';
      const mockRefresh = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQURNSU4iLCJ0eXBlIjoicmVmcmVzaCJ9.mock_refresh';
      
      setUser(defaultUser);
      setTokens({ access: mockAccess, refresh: mockRefresh });
      localStorage.setItem('sukulu_access_token', mockAccess);
      localStorage.setItem('sukulu_refresh_token', mockRefresh);
      localStorage.setItem('sukulu_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password = 'password123', roleOverride?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. First attempt to call the actual Django DRF SimpleJWT backend endpoint
      try {
        const response = await apiClient.post('/auth/token/', {
          username: identifier,
          password: password,
        });

        if (response.data?.access) {
          const access = response.data.access;
          const refresh = response.data.refresh || 'mock_refresh';
          // Decode or fetch user profile from DRF
          const profileResponse = await apiClient.get('/auth/user/', {
            headers: { Authorization: `Bearer ${access}` },
          });
          const fetchedUser = profileResponse.data || INITIAL_USERS[0];

          setUser(fetchedUser);
          setTokens({ access, refresh });
          localStorage.setItem('sukulu_access_token', access);
          localStorage.setItem('sukulu_refresh_token', refresh);
          localStorage.setItem('sukulu_user', JSON.stringify(fetchedUser));
          setIsLoading(false);
          return true;
        }
      } catch (backendErr) {
        console.warn('Backend server connection failed or unavailable, falling back to mock JWT session:', backendErr);
      }

      // 2. Fallback to mock login matching requested role or user
      let matchedUser = INITIAL_USERS.find(
        (u) => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()
      );

      if (!matchedUser && roleOverride) {
        matchedUser = INITIAL_USERS.find((u) => u.role === roleOverride);
      }

      if (!matchedUser) {
        matchedUser = INITIAL_USERS[0]; // Admin fallback
      }

      const access = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJyb2xlIjoi${matchedUser.role}"}.mock_jwt_access`;
      const refresh = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJyb2xlIjoi${matchedUser.role}"}.mock_jwt_refresh`;

      setUser(matchedUser);
      setTokens({ access, refresh });
      localStorage.setItem('sukulu_access_token', access);
      localStorage.setItem('sukulu_refresh_token', refresh);
      localStorage.setItem('sukulu_user', JSON.stringify(matchedUser));

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('sukulu_access_token');
    localStorage.removeItem('sukulu_refresh_token');
    localStorage.removeItem('sukulu_user');
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === newRole) || {
      ...INITIAL_USERS[0],
      role: newRole,
      first_name: `Utilisateur (${newRole})`,
    };
    setUser(targetUser);
    localStorage.setItem('sukulu_user', JSON.stringify(targetUser));
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const newUserData = { ...user, ...updatedFields };
    setUser(newUserData);
    localStorage.setItem('sukulu_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        activeRole: user?.role || 'ADMIN',
        login,
        logout,
        switchRole,
        updateUser,
        apiBaseUrl,
        setApiBaseUrl,
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
