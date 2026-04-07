import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedRoutes = ["/chat"];
const authRoutes = ["/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  // Redirect authenticated users away from auth page
  if (authRoutes.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // Redirect unauthenticated users to login
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
