import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "bb_session";

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temSessao = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!temSessao && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (temSessao && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
