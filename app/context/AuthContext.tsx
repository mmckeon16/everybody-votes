import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Setting up auth listeners...');

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', {
        hasSession: !!session,
        error,
        userId: session?.user?.id,
      });
      if (session) {
        setSession(session);
        checkProfileCompletion(session);
      }
      setIsLoading(false);
    });

    // Auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', {
        event,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        sessionExists: !!session,
      });

      if (session) {
        setSession(session);
        await checkProfileCompletion(session);
      } else {
        setSession(null);
        setHasCompletedProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkProfileCompletion = async (session: Session) => {
    if (!session?.user) return false;

    console.log('Checking profileCompletion for user:', session.user.id);
    console.log('User metadata:', session.user.user_metadata);
    // Check user metadata directly
    if (!session.user.user_metadata?.completed_profile) {
      setHasCompletedProfile(false);
      router.push('/auth/complete-profile');
    } else {
      setHasCompletedProfile(true);
    }
  };

  const value = {
    session,
    isLoading,
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
    },
    signOut: async () => {
      await supabase.auth.signOut();
      router.replace('/');
    },
    isAuthenticated: !!session,
    hasCompletedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
