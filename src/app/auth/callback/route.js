import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const redirectPath = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL('/login?authError=link', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
