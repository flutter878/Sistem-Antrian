import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  // Route yang butuh proteksi
  const isAdminRoute = pathname.startsWith("/admin");
  const isPetugasRoute = pathname.startsWith("/petugas");
  const isSatpamRoute = pathname.startsWith("/satpam");
  const isPemohonRoute = pathname.startsWith("/pemohon");

  // Jika belum login dan akses route terproteksi
  if (!session && (isAdminRoute || isPetugasRoute || isSatpamRoute || isPemohonRoute)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Proteksi per role
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (isPetugasRoute && role !== "petugas" && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (isSatpamRoute && role !== "satpam" && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (isPemohonRoute && role !== "pemohon") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/petugas/:path*",
    "/satpam/:path*",
    "/pemohon/:path*",
  ],
};
