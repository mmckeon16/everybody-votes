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
        checkProfileCompletion(session.user.id);
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
        await checkProfileCompletion(session.user.id);
      } else {
        setSession(null);
        setHasCompletedProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkProfileCompletion(userId: string | undefined) {
    if (!userId) {
      setHasCompletedProfile(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('demographics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        setHasCompletedProfile(false);
        router.push('/auth/complete-profile');
      } else {
        setHasCompletedProfile(true);
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      setHasCompletedProfile(false);
    }
  }

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
    signOut: () => supabase.auth.signOut(),
    isAuthenticated: !!session,
    hasCompletedProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
