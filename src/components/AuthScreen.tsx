'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { allowSignup, supabase } from '@/lib/supabase';
import { Logo, Rocket } from './Logo';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo('Conta criada! Confirme o e-mail que enviamos e depois entre.');
          setMode('login');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-space stars relative flex min-h-screen overflow-hidden">
      {/* planeta / horizonte */}
      <div className="pointer-events-none absolute -bottom-[38vh] -left-[15vw] h-[60vh] w-[130vw] rounded-[50%] border-t-2 border-neon/70 bg-[radial-gradient(ellipse_at_top,rgba(47,123,255,.25),transparent_60%)] shadow-[0_-30px_140px_rgba(47,123,255,.45)]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fire/20 blur-3xl" />

      {/* hero */}
      <section className="relative hidden flex-1 flex-col items-center justify-center lg:flex">
        <div className="relative">
          <Logo size="lg" tagline />
          <Rocket className="absolute -right-44 -top-28 h-80 w-auto animate-float drop-shadow-[0_0_30px_rgba(47,123,255,.6)]" />
        </div>
        <pre className="mt-16 max-w-md rounded-xl border border-neon/20 bg-ink-950/60 p-4 font-mono text-xs leading-relaxed text-slate-400 backdrop-blur">
          <span className="text-neon-cyan">const</span> team = <span className="text-fire">&apos;Tech Devs&apos;</span>;{'\n'}
          <span className="text-neon-cyan">const</span> goal = [<span className="text-fire">&apos;ship&apos;</span>, <span className="text-fire">&apos;learn&apos;</span>, <span className="text-fire">&apos;grow&apos;</span>];{'\n'}
          <span className="text-neon-soft">launch</span>(team, goal); <span className="text-slate-600">// 🚀</span>
        </pre>
      </section>

      {/* formulário */}
      <section className="relative flex w-full items-center justify-center p-5 lg:w-[480px] lg:shrink-0">
        <div className="glass-strong w-full max-w-sm rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo size="sm" tagline />
          </div>
          <h1 className="font-display text-2xl font-extrabold italic text-white">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Entre para o time'}
          </h1>
          <p className="mb-5 mt-1 text-sm text-slate-400">
            {mode === 'login'
              ? 'Acesse o quadro de atividades da equipe.'
              : 'Crie sua conta para acompanhar as tarefas.'}
          </p>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="label">Nome</label>
                <input
                  className="input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {info}
              </p>
            )}

            <button className="btn-fire w-full" disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          {allowSignup && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="mt-4 w-full text-center text-sm text-slate-400 transition hover:text-neon-cyan"
            >
              {mode === 'login' ? 'Ainda não tem conta? Criar conta' : 'Já tem conta? Entrar'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="bg-space stars flex min-h-screen items-center justify-center p-5">
      <div className="glass-strong w-full max-w-lg rounded-2xl p-7">
        <div className="mb-5 flex justify-center">
          <Logo size="sm" tagline />
        </div>
        <h1 className="font-display text-xl font-extrabold italic text-fire">Falta conectar o Supabase</h1>
        <p className="mt-2 text-sm text-slate-300">
          Crie o arquivo <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-neon-cyan">.env.local</code> na
          raiz do projeto (ou cadastre as variáveis na Vercel) com:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-ink-600/60 bg-ink-950 p-3 font-mono text-xs text-slate-300">
{`NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA-ANON-KEY`}
        </pre>
        <p className="mt-3 text-sm text-slate-400">
          Depois rode o arquivo <code className="font-mono text-neon-cyan">supabase/schema.sql</code> no SQL Editor do
          Supabase e reinicie o servidor.
        </p>
      </div>
    </div>
  );
}
