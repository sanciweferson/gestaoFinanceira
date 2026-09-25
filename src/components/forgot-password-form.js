'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (authError) throw authError;
      setMessage('Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha. Confira também a caixa de spam.');
    } catch (authError) {
      setError(authError.message || 'Não foi possível enviar o link. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/login">
          <span className="brand-mark">M</span>
          <span>meu<span className="brand-light">financeiro</span></span>
        </Link>
        <p className="eyebrow">RECUPERAÇÃO DE ACESSO</p>
        <h1>Esqueceu sua senha?</h1>
        <p className="auth-description">Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required /></label>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message auth-success" role="status">{message}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Enviar link de recuperação'}</button>
        </form>
        <p className="auth-switch"><Link href="/login">Voltar para entrar</Link></p>
        <p className="auth-security">Por segurança, nunca compartilhamos sua senha.</p>
      </section>
    </main>
  );
}
