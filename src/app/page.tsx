'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isConfigured, supabase } from '@/lib/supabase';
import { AuthScreen, SetupNotice } from '@/components/AuthScreen';
import { AppShell } from '@/components/AppShell';
import { Rocket } from '@/components/Logo';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isConfigured) return <SetupNotice />;

  if (loading) {
    return (
      <div className="bg-space flex min-h-screen items-center justify-center">
        <Rocket className="h-24 w-auto animate-float" />
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <AppShell session={session} />;
}
