'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Confira e tente novamente.');
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
      router.replace('/');
      router.refresh();
    } catch (authError) {
      setError(authError.message || 'Não foi possível atualizar a senha. Peça um novo link e tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">M</span>
          <span>meu<span className="brand-light">financeiro</span></span>
        </div>
        <p className="eyebrow">NOVA SENHA</p>
        <h1>Crie uma nova senha</h1>
        <p className="auth-description">Escolha uma senha nova com pelo menos 6 caracteres.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-field">Nova senha<input type="password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 6 caracteres" required /></label>
          <label className="form-field">Confirme a nova senha<input type="password" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Digite a senha novamente" required /></label>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </section>
    </main>
  );
}
