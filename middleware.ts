import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";

// Rutes protegides
const protectedRoutes = ["/user", "/profile", "/account"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Si és sessió temporal de recovery → redirigeix a login
  if (session?.user?.recovery_sent_at) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Rutes protegides: sense sessió normal → login
  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/user/:path*", "/profile/:path*", "/account/:path*"],
};
