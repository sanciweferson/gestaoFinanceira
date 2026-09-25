'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    const supabase = createClient();

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Informe seu nome para criar a conta.');
        if (!acceptedLegal) throw new Error('Leia e aceite os Termos de Uso e a Política de Privacidade para criar a conta.');
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName.trim(), legal_version: '2026-09-25', legal_accepted_at: new Date().toISOString() },
          },
        });
        if (authError) throw authError;
        if (data.session) { router.replace('/'); router.refresh(); }
        else setMessage('Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace('/');
        router.refresh();
      }
    } catch (authError) {
      setError(authError.message || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark">M</span>
          <span>meu<span className="brand-light">financeiro</span></span>
        </Link>
        <p className="eyebrow">SEU ESPAÇO FINANCEIRO</p>
        <h1>{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</h1>
        <p className="auth-description">Entre para consultar seus lançamentos em qualquer dispositivo.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && <label className="form-field">Seu nome<input type="text" autoComplete="name" maxLength={80} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Como podemos chamar você?" required /></label>}
          <label className="form-field">E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required /></label>
          <div className="auth-password-field">
          <label className="form-field">Senha<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 6 caracteres" required /></label>
          {mode === 'signup' && <label className="legal-consent"><input type="checkbox" checked={acceptedLegal} onChange={(event) => setAcceptedLegal(event.target.checked)} /><span>Li e aceito os <Link href="/terms" target="_blank" rel="noreferrer">Termos de Uso</Link> e a <Link href="/privacy" target="_blank" rel="noreferrer">Política de Privacidade</Link>.</span></label>}
            {mode === 'login' && <Link className="auth-inline-link" href="/forgot-password">Esqueceu a senha?</Link>}
          </div>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message auth-success" role="status">{message}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}>{mode === 'login' ? 'Criar conta' : 'Entrar'}</button></p>
        <p className="auth-security">Ao criar uma conta, você concorda com os <Link href="/terms">Termos de Uso</Link> e a <Link href="/privacy">Política de Privacidade</Link>. Cada conta acessa somente os próprios lançamentos.</p>
      </section>
    </main>
  );
}
