import { redirect } from 'next/navigation';
import ResetPasswordForm from '../../components/reset-password-form';
import SetupNotice from '../../components/setup-notice';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!configured) return <SetupNotice />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <ResetPasswordForm />;
}
