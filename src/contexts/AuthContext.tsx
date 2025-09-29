import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCredentials, logout as logoutAction, hydrateAuth, setLoading } from '@/store/authSlice';
import { useLoginMutation, useRegisterMutation, useGetProfileQuery, User } from '@/store/api-new';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string, licenseNumber?: string, companyName?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth);
  
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  
  // Auto-fetch user profile if token exists but no user data
  const { data: profileData, error: profileError } = useGetProfileQuery(undefined, {
    skip: !token || !!user,
  });

  useEffect(() => {
    // Hydrate auth state from localStorage on app start
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    // Update user data if profile is fetched
    if (profileData?.data) {
      dispatch(setCredentials({ user: profileData.data, token: token! }));
    }
  }, [profileData, dispatch, token]);

  useEffect(() => {
    // Handle profile fetch error (likely invalid/expired token)
    if (profileError) {
      dispatch(logoutAction());
      toast.error('Session expired. Please log in again.');
    }
  }, [profileError, dispatch]);

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      const result = await loginMutation({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.data.user, token: result.data.token }));
      toast.success('Login successful!');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role?: string,
    licenseNumber?: string,
    companyName?: string
  ) => {
    dispatch(setLoading(true));
    try {
      const result = await registerMutation({
        email,
        password,
        name,
        role: role as 'user' | 'agent',
        licenseNumber,
        companyName
      }).unwrap();
      dispatch(setCredentials({ user: result.data.user, token: result.data.token }));
      toast.success('Registration successful!');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated,
      login, 
      register, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};