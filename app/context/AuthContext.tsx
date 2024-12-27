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
  refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const router = useRouter();

  const refreshUserMetadata = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.refreshSession();
      console.log(
        'Refreshed session metadata:',
        currentSession?.user?.user_metadata
      );

      if (currentSession?.user) {
        setSession(currentSession);
        const isCompleted =
          !!currentSession.user.user_metadata?.completed_profile;
        console.log('Profile completion status:', isCompleted);
        setHasCompletedProfile(isCompleted);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Initial setup
  useEffect(() => {
    console.log('Initial auth setup...');

    const setupAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        console.log('Initial session:', {
          exists: !!initialSession,
          metadata: initialSession?.user?.user_metadata,
        });

        if (initialSession) {
          setSession(initialSession);
          await refreshUserMetadata();
        }
      } catch (error) {
        console.error('Error in initial auth setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

  // Auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', {
        event,
        metadata: currentSession?.user?.user_metadata,
      });

      if (currentSession) {
        setSession(currentSession);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUserMetadata();
        }
      } else {
        setSession(null);
        setHasCompletedProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Expose a method to manually refresh the profile status
  const refreshProfileStatus = async () => {
    await refreshUserMetadata();
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
      console.log('Signing out...');

      const { error } = await supabase.auth.signOut();
      if (error) console.log(error);
      console.log('signed out...');
      router.replace('/');
    },
    isAuthenticated: !!session,
    hasCompletedProfile,
    refreshProfileStatus, // Expose this method to force refresh when needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
