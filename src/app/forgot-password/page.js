import ForgotPasswordForm from '../../components/forgot-password-form';
import SetupNotice from '../../components/setup-notice';

export default function ForgotPasswordPage() {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!configured) return <SetupNotice />;
  return <ForgotPasswordForm />;
}
