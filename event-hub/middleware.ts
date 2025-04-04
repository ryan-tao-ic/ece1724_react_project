import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Forward token manually so `auth()` can decode it later
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-auth-token", JSON.stringify(token));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/events/:path*", "/dashboard/:path*", "/api/profile/:path*", "/profile/:path*"],
};
