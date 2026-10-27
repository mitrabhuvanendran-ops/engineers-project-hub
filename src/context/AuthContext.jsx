import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize Auth state
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // In demo/unconfigured mode, retrieve saved demo user if any
      const savedUser = localStorage.getItem('hub_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // If parse fails, set default demo user
          setUser({
            id: 'demo-user-001',
            email: 'engineer@demo.local',
            user_metadata: { full_name: 'Alex Rivera' }
          });
        }
      } else {
        // Default demo user so app is immediately usable
        const defaultUser = {
          id: 'demo-user-001',
          email: 'engineer@demo.local',
          user_metadata: { full_name: 'Alex Rivera' }
        };
        setUser(defaultUser);
        localStorage.setItem('hub_demo_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
      return;
    }

    // Live Supabase Auth
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching Supabase session:', error.message);
        }
        setSession(session);
        setUser(session?.user || null);
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign In with email & password
  const signIn = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      // Local demo sign in
      const mockUser = {
        id: 'demo-user-001',
        email,
        user_metadata: { full_name: email.split('@')[0] }
      };
      setUser(mockUser);
      localStorage.setItem('hub_demo_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  // Sign Up with email & password
  const signUp = async (email, password, fullName) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      // Local demo sign up
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] }
      };
      setUser(mockUser);
      localStorage.setItem('hub_demo_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  // Sign Out
  const signOut = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      localStorage.removeItem('hub_demo_user');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      setAuthError(err.message);
      return { error: err };
    }
  };

  // Quick Switch / Demo Login
  const loginAsDemo = (email = 'engineer@demo.local', fullName = 'Alex Rivera') => {
    const demoUser = {
      id: 'demo-user-001',
      email,
      user_metadata: { full_name: fullName }
    };
    setUser(demoUser);
    localStorage.setItem('hub_demo_user', JSON.stringify(demoUser));
  };

  const value = {
    user,
    session,
    loading,
    authError,
    isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    loginAsDemo,
    setAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
