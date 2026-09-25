'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

const categories = {
  expense: ['Alimentação', 'Casa', 'Contas', 'Educação', 'Lazer', 'Saúde', 'Transporte', 'Compras', 'Outros'],
  income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Reembolso', 'Outros'],
};

const THEME_KEY = 'meu-financeiro-tema-v1';

function getSavedTheme() {
  return window.localStorage.getItem(THEME_KEY) || 'dark';
}

function subscribeToTheme(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener('finance-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('finance-theme-change', callback);
  };
}

function localDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function dateLabel(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}

function toBackupEntry(item) {
  return {
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    type: item.type,
    category: item.category,
    date: item.date,
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  };
}

export default function FinanceDashboard({ user, initialTransactions, initialError }) {
  const router = useRouter();
  const entryDialog = useRef(null);
  const deleteDialog = useRef(null);
  const importFile = useRef(null);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const theme = useSyncExternalStore(subscribeToTheme, getSavedTheme, () => 'dark');
  const [entryOpen, setEntryOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [form, setForm] = useState({ type: 'expense', description: '', amount: '', date: '', category: 'Alimentação' });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState(initialError);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!user.avatarPath) return () => { cancelled = true; };
    createClient().storage.from('avatars').createSignedUrl(user.avatarPath, 3600).then(({ data, error: avatarError }) => {
      if (!cancelled && !avatarError) setAvatarUrl(data?.signedUrl || '');
    });
    return () => { cancelled = true; };
  }, [user.avatarPath]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function updateTheme(nextTheme) {
    window.localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event('finance-theme-change'));
  }

  useEffect(() => {
    if (entryOpen && !entryDialog.current?.open) entryDialog.current?.showModal();
    if (!entryOpen && entryDialog.current?.open) entryDialog.current.close();
  }, [entryOpen]);

  useEffect(() => {
    if (pendingDelete && !deleteDialog.current?.open) deleteDialog.current?.showModal();
    if (!pendingDelete && deleteDialog.current?.open) deleteDialog.current.close();
  }, [pendingDelete]);

  const monthEntries = useMemo(() => transactions.filter((item) => item.date.startsWith(month)), [transactions, month]);
  const visibleEntries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return monthEntries.filter((item) => (typeFilter === 'all' || item.type === typeFilter) &&
      (!query || `${item.description} ${item.category}`.toLocaleLowerCase('pt-BR').includes(query)))
      .sort((a, b) => b.date.localeCompare(a.date) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [monthEntries, search, typeFilter]);
  const income = monthEntries.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = monthEntries.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expense;

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }

  function openNewEntry() {
    setEditing(null);
    setForm({ type: 'expense', description: '', amount: '', date: localDateString(), category: categories.expense[0] });
    setEntryOpen(true);
  }

  function openEditEntry(item) {
    setEditing(item);
    setForm({ type: item.type, description: item.description, amount: String(item.amount), date: item.date, category: item.category });
    setEntryOpen(true);
  }

  function changeType(nextType) {
    setForm((current) => ({ ...current, type: nextType, category: categories[nextType][0] }));
  }

  async function saveEntry(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const supabase = createClient();
    const payload = {
      description: form.description.trim(),
      amount: Math.round(Number(form.amount) * 100) / 100,
      type: form.type,
      category: form.category,
      transaction_date: form.date,
      user_id: user.id,
    };

    const result = editing
      ? await supabase.from('transactions').update(payload).eq('id', editing.id).select().single()
      : await supabase.from('transactions').insert(payload).select().single();

    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    const saved = { id: result.data.id, description: result.data.description, amount: Number(result.data.amount), type: result.data.type, category: result.data.category, date: result.data.transaction_date, createdAt: result.data.created_at };
    setTransactions((current) => editing ? current.map((item) => item.id === editing.id ? saved : item) : [...current, saved]);
    setEntryOpen(false);
    notify(editing ? 'Lançamento atualizado.' : 'Lançamento salvo.');
  }

  async function deleteEntry() {
    if (!pendingDelete) return;
    setBusy(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', pendingDelete.id);
    setBusy(false);
    if (deleteError) { setError(deleteError.message); setPendingDelete(null); return; }
    setTransactions((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    notify('Lançamento excluído.');
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  function exportBackup() {
    const payload = { app: 'meu-financeiro', version: 1, exportedAt: new Date().toISOString(), transactions: transactions.map(toBackupEntry) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meu-financeiro-backup-${localDateString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Backup exportado. Guarde o arquivo em um local seguro.');
  }

  async function importBackup(file) {
    try {
      const json = JSON.parse(await file.text());
      const input = Array.isArray(json) ? json : json.transactions;
      if (!Array.isArray(input) || input.some((item) => !item || !item.description || !item.date || !['income', 'expense'].includes(item.type) || Number(item.amount) <= 0)) {
        throw new Error('Esse arquivo não parece ser um backup válido.');
      }
      if (!window.confirm(`Importar ${input.length} lançamento(s)? Eles serão adicionados à sua conta Supabase.`)) return;
      setBusy(true);
      const supabase = createClient();
      const rows = input.map((item) => ({
        id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id || '') ? item.id : crypto.randomUUID(),
        user_id: user.id,
        description: String(item.description).slice(0, 70),
        amount: Math.round(Number(item.amount) * 100) / 100,
        type: item.type,
        category: String(item.category || 'Outros'),
        transaction_date: item.date,
      }));
      const { error: importError } = await supabase.from('transactions').upsert(rows, { onConflict: 'id' });
      setBusy(false);
      if (importError) throw importError;
      const { data, error: reloadError } = await supabase.from('transactions').select('id, description, amount, type, category, transaction_date, created_at').order('transaction_date', { ascending: false });
      if (reloadError) throw reloadError;
      setTransactions((data || []).map((item) => ({ id: item.id, description: item.description, amount: Number(item.amount), type: item.type, category: item.category, date: item.transaction_date, createdAt: item.created_at })));
      notify('Backup importado para sua conta.');
    } catch (importError) {
      setBusy(false);
      setError(importError.message || 'Não foi possível importar o backup.');
    } finally {
      if (importFile.current) importFile.current.value = '';
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Meu Financeiro, início"><span className="brand-mark">M</span><span>meu<span className="brand-light">financeiro</span></span></a>
        <div className="side-label">MENU</div>
        <nav aria-label="Menu principal"><a className="nav-link active" href="#inicio"><span className="nav-icon">⌂</span> Visão geral</a><a className="nav-link" href="#lancamentos"><span className="nav-icon">↕</span> Lançamentos</a></nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><span className="privacy-icon">▣</span><div><strong>Dados sincronizados</strong><p>Salvos com segurança na sua conta.</p></div></div>
          <button className="nav-link theme-button" onClick={() => updateTheme(theme === 'dark' ? 'light' : 'dark')} type="button"><span className="nav-icon">{theme === 'dark' ? '☼' : '☾'}</span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</button>
        </div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar"><div><p className="eyebrow">CONTROLE PESSOAL</p><h1>Visão geral</h1></div><div className="topbar-actions"><Link className="profile-summary" href="/profile"><span className={`profile-avatar${avatarUrl ? ' has-photo' : ''}`} style={avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : undefined} aria-label={avatarUrl ? `Foto de ${user.fullName || user.email}` : undefined}>{avatarUrl ? '' : (user.fullName || user.email || 'U').slice(0, 1).toUpperCase()}</span><span className="profile-summary-copy"><strong>{user.fullName || 'Meu perfil'}</strong><small>{user.email}</small></span></Link><label className="month-picker"><span className="sr-only">Mês dos lançamentos</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label><button className="button button-primary" onClick={openNewEntry} type="button"><span aria-hidden="true">＋</span> Novo lançamento</button><button className="button button-secondary logout-button" onClick={signOut} type="button">Sair</button></div></header>

        {error && <div className="notice-error" role="alert"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Fechar mensagem">×</button></div>}
        <section className="summary-grid" aria-label="Resumo do mês">
          <article className="summary-card"><div className="card-heading"><span>Receitas do mês</span><span className="summary-icon income-icon">↗</span></div><strong className="summary-value">{money(income)}</strong><p className="summary-caption">Entradas registradas</p></article>
          <article className="summary-card"><div className="card-heading"><span>Despesas do mês</span><span className="summary-icon expense-icon">↘</span></div><strong className="summary-value">{money(expense)}</strong><p className="summary-caption">Saídas registradas</p></article>
          <article className="summary-card balance-card"><div className="card-heading"><span>Saldo do mês</span><span className="summary-icon balance-icon">＝</span></div><strong className="summary-value" style={{ color: balance < 0 ? 'var(--red)' : 'var(--accent)' }}>{money(balance)}</strong><p className="summary-caption">{balance < 0 ? 'As despesas passaram das receitas' : 'Receitas menos despesas'}</p></article>
        </section>

        <section className="content-card" id="lancamentos">
          <div className="section-heading"><div><p className="eyebrow">MOVIMENTAÇÕES</p><h2>Lançamentos</h2></div><div className="section-actions"><button className="button button-secondary" onClick={() => importFile.current?.click()} type="button">↑ <span>Importar backup</span></button><button className="button button-secondary" onClick={exportBackup} type="button">↓ <span>Exportar backup</span></button></div></div>
          <div className="filters-row"><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lançamento..." /></label><label className="select-wrap"><span className="sr-only">Filtrar por tipo</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">Todos os tipos</option><option value="income">Receitas</option><option value="expense">Despesas</option></select></label></div>
          <div className="table-wrap">{visibleEntries.length > 0 ? <table><thead><tr><th>DESCRIÇÃO</th><th>CATEGORIA</th><th>DATA</th><th>VALOR</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
            {visibleEntries.map((item) => <tr key={item.id}><td><div className="description-cell"><span className={`transaction-mark ${item.type === 'income' ? 'mark-income' : 'mark-expense'}`}>{item.type === 'income' ? '↗' : '↘'}</span><span>{item.description}</span></div></td><td><span className="category-pill">{item.category}</span></td><td>{dateLabel(item.date)}</td><td className={item.type === 'income' ? 'amount-income' : 'amount-expense'}>{item.type === 'income' ? '+' : '−'} {money(Number(item.amount))}</td><td><div className="row-actions"><button className="row-action" onClick={() => openEditEntry(item)} type="button" aria-label={`Editar ${item.description}`} title="Editar">✎</button><button className="row-action" onClick={() => setPendingDelete(item)} type="button" aria-label={`Excluir ${item.description}`} title="Excluir">×</button></div></td></tr>)}
          </tbody></table> : <div className="empty-state visible"><span className="empty-icon">↕</span><strong>Nenhum lançamento por aqui</strong><p>Adicione uma receita ou despesa para começar.</p><button className="button button-primary" onClick={openNewEntry} type="button">＋ Adicionar lançamento</button></div>}
          </div>
        </section>
        <footer className="page-footer"><span>Feito para cuidar melhor do seu dinheiro.</span><span><Link href="/terms">Termos de Uso</Link> · <Link href="/privacy">Privacidade</Link> · Conta: {user.email}</span></footer>
      </main>

      <dialog className="entry-dialog" ref={entryDialog} onCancel={(event) => { event.preventDefault(); setEntryOpen(false); }}>
        <form onSubmit={saveEntry}>
          <div className="dialog-heading"><div><p className="eyebrow">MOVIMENTAÇÃO</p><h2>{editing ? 'Editar lançamento' : 'Novo lançamento'}</h2></div><button className="icon-button" onClick={() => setEntryOpen(false)} type="button" aria-label="Fechar">×</button></div>
          <fieldset className="type-toggle"><legend>Tipo de lançamento</legend><label><input type="radio" name="entry-type" value="expense" checked={form.type === 'expense'} onChange={() => changeType('expense')} /><span>Despesa</span></label><label><input type="radio" name="entry-type" value="income" checked={form.type === 'income'} onChange={() => changeType('income')} /><span>Receita</span></label></fieldset>
          <label className="form-field">Descrição<input maxLength={70} placeholder="Ex.: Conta de luz" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <div className="form-row"><label className="form-field">Valor (R$)<input type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0,00" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></label><label className="form-field">Data<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label></div>
          <label className="form-field">Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories[form.type].map((category) => <option key={category}>{category}</option>)}</select></label>
          <div className="dialog-actions"><button className="button button-secondary" onClick={() => setEntryOpen(false)} type="button">Cancelar</button><button className="button button-primary" disabled={busy} type="submit">{busy ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar lançamento'}</button></div>
        </form>
      </dialog>

      <dialog className="confirm-dialog" ref={deleteDialog} onCancel={(event) => { event.preventDefault(); setPendingDelete(null); }}>
        {pendingDelete && <div className="confirm-content"><span className="confirm-icon" aria-hidden="true">!</span><p className="eyebrow">CONFIRMAR AÇÃO</p><h2>Excluir lançamento?</h2><p>Este lançamento será removido da sua conta.</p><div className="confirm-item"><span>{pendingDelete.description}</span><strong>{pendingDelete.type === 'income' ? '+' : '−'} {money(Number(pendingDelete.amount))}</strong></div><div className="confirm-actions"><button className="button button-secondary" onClick={() => setPendingDelete(null)} type="button">Manter lançamento</button><button className="button button-danger" onClick={deleteEntry} disabled={busy} type="button">{busy ? 'Excluindo...' : 'Excluir lançamento'}</button></div></div>}
      </dialog>

      <input ref={importFile} onChange={(event) => { if (event.target.files?.[0]) importBackup(event.target.files[0]); }} type="file" accept="application/json,.json" hidden />
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
