import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip all checks for verifyEmail and resetPassword paths
  if (req.nextUrl.pathname.startsWith("/verifyEmail") || 
      req.nextUrl.pathname.startsWith("/resetPassword")) {
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
    "/resetPassword/:path*",
  ],
};
