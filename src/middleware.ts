export { middlewareAuth as default } from "@/lib/auth-edge";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icons|manifest.webmanifest|favicon.ico|icon.svg).*)",
  ],
};
