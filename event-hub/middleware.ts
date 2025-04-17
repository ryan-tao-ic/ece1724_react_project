import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip all checks for verifyEmail path
  if (req.nextUrl.pathname.startsWith("/verifyEmail")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-auth-token", JSON.stringify(token));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/events/:path*",
    "/dashboard/:path*",
    "/api/profile/:path*",
    "/profile/:path*",
    "/roleManagement/:path*",
    "/verifyEmail/:path*",
    "/lounge/:path*",
  ],
};
