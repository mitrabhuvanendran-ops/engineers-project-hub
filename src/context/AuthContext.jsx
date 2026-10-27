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
      // In demo/unconfigured mode, check if user has previously logged in during this session
      const savedUser = sessionStorage.getItem('hub_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        // Initially show Login Page
        setUser(null);
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
        setUser(null);
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
      // Local fallback sign in
      const mockUser = {
        id: 'user-' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
        email,
        isDemo: false,
        user_metadata: { full_name: email.split('@')[0] }
      };
      setUser(mockUser);
      sessionStorage.setItem('hub_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
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
      // Local fallback sign up
      const mockUser = {
        id: 'user-' + Date.now(),
        email,
        isDemo: false,
        user_metadata: { full_name: fullName || email.split('@')[0] }
      };
      setUser(mockUser);
      sessionStorage.setItem('hub_user', JSON.stringify(mockUser));
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
      if (data.user) {
        setUser(data.user);
      }
      return { data, error: null };
    } catch (err) {
      setAuthError(err.message);
      return { data: null, error: err };
    }
  };

  // Sign Out
  const signOut = async () => {
    setAuthError(null);
    sessionStorage.removeItem('hub_user');
    setUser(null);
    setSession(null);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err.message);
      }
    }
    return { error: null };
  };

  // Quick Switch / Demo Login (for grading or quick testing)
  const loginAsDemo = (email = 'alex.rivera@engineering.edu', fullName = 'Alex Rivera') => {
    const demoUser = {
      id: 'demo-user-001',
      email,
      isDemo: true,
      user_metadata: { full_name: fullName }
    };
    setUser(demoUser);
    sessionStorage.setItem('hub_user', JSON.stringify(demoUser));
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
