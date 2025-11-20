import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Redirect to login if not authenticated
  if (!session) {
    if (pathname.startsWith('/student') || pathname.startsWith('/hod') || pathname.startsWith('/guard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return res;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role-based routing
  if (pathname.startsWith('/student') && profile.role !== 'student') {
    return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, req.url));
  }

  if (pathname.startsWith('/hod') && profile.role !== 'hod') {
    return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, req.url));
  }

  if (pathname.startsWith('/guard') && profile.role !== 'guard') {
    return NextResponse.redirect(new URL(`/${profile.role}/scanner`, req.url));
  }

  return res;
}

export const config = {
  matcher: ['/student/:path*', '/hod/:path*', '/guard/:path*'],
};