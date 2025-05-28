import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/project-board",
  "/api/projects",
  "/api/db"
]

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = [
  "/login",
  "/signup",
  "/reset-password"
]

export default async function middleware(request: NextRequest) {
  try {
    console.log("Middleware called for:", request.nextUrl.pathname)
    
    const session = await auth()
    console.log("Session:", session ? "authenticated" : "not authenticated")
    
    const { pathname } = request.nextUrl

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      console.log("Redirecting to login:", loginUrl.toString())
      return NextResponse.redirect(loginUrl)
    }

    // Redirect to dashboard if accessing public route with session
    if (isPublicRoute && session) {
      console.log("Redirecting authenticated user to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redirect root path to dashboard if authenticated, login if not
    if (pathname === "/") {
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // Continue to the next middleware/page on error
    return NextResponse.next()
  }
}

export const config = {
   matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ],
}
