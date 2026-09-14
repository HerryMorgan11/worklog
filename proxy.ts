import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/__clerk",
  "/api/time-entries",
  "/api/redmine",
];

export default clerkMiddleware(
  async (auth, request) => {
    const { pathname } = request.nextUrl;
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    if (!isPublicRoute) {
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
