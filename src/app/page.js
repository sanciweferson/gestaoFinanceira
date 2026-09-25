import { redirect } from 'next/navigation';
import FinanceDashboard from '../components/finance-dashboard';
import SetupNotice from '../components/setup-notice';
import { createClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!configured) return <SetupNotice />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('transactions')
    .select('id, description, amount, type, category, transaction_date, created_at')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  const initialTransactions = (data || []).map((item) => ({
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    type: item.type,
    category: item.category,
    date: item.transaction_date,
    createdAt: item.created_at,
  }));

  return (
    <FinanceDashboard
      user={{ id: user.id, email: user.email || '' }}
      initialTransactions={initialTransactions}
      initialError={error?.message || ''}
    />
  );
}
