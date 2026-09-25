import { redirect } from 'next/navigation';
import ProfileForm from '../../components/profile-form';
import SetupNotice from '../../components/setup-notice';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!configured) return <SetupNotice />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <ProfileForm user={{
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || '',
    avatarPath: user.user_metadata?.avatar_path || '',
    metadata: user.user_metadata || {},
  }} />;
}
