import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

/**
 * Single source of truth for the current Supabase auth session.
 * Replaces the old fake `gstify_session` localStorage flag — the app is
 * "logged in" exactly when Supabase says there's a valid session.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password });

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  // Redirects to Google, then back to the current page (Supabase handles
  // the OAuth exchange and fires onAuthStateChange above once it's done).
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

  return {
    session,
    user: session?.user ?? null,
    isLoggedIn: !!session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };
}
