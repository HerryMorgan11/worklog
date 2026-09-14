import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = ["/sign-in", "/sign-up", "/__clerk"];

export default clerkMiddleware(
  async (auth, request) => {
    const { pathname } = request.nextUrl;
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    const isTimeEntriesApi = pathname === "/api/time-entries";

    if (isTimeEntriesApi) {
      await auth.protect({ token: ["session_token", "api_key"] });
    } else if (!isPublicRoute) {
      await auth.protect();
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
