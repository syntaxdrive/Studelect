import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Building2, Lock, ShieldCheck, User, LogOut, LayoutDashboard, Zap } from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "StudElect • Multi-Tenant Student Election Platform",
  description: "Secure, verifiable digital elections for Nigerian tertiary institutions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/studelect-mark.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900 font-sans">
        {/* Sleek Minimalist Conditional Navbar */}
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/studelect-mark.jpg"
                alt="StudElect Emblem"
                className="h-8 w-8 rounded-lg object-cover shadow-xs"
              />
              <span className="text-sm font-bold tracking-tight text-zinc-900">
                Stud<span className="text-blue-600">Elect</span>
              </span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4 text-xs font-medium">
              <Link
                href="/#campuses"
                className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Campuses</span>
              </Link>

              <Link
                href="/pricing"
                className="px-3 py-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Pricing</span>
              </Link>

              {session ? (
                /* Authenticated Admin View */
                <div className="flex items-center gap-2">
                  <Link
                    href={
                      session.role === "SUPER_ADMIN"
                        ? "/super-admin"
                        : `/${session.institutionSlug || "unilag"}/admin`
                    }
                    className="px-3 py-1.5 rounded-md bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-800 transition flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-zinc-700" />
                    <span className="font-semibold">{session.fullName.split(" ")[0]}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-white">
                      {session.role === "SUPER_ADMIN" ? "SUPER" : "ELCOM"}
                    </span>
                  </Link>

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-red-600 transition"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Unauthenticated Public View */
                <Link
                  href="/admin/login"
                  className="px-3 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Sign In</span>
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Minimalist Footer */}
        <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs text-zinc-500 print:hidden">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-zinc-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-zinc-800" />
              <span>StudElect Nigeria • Multi-Tenant Student E-Voting Architecture</span>
            </div>
            <p className="text-zinc-400">
              End-to-End Cryptographic Auditability & Constitutional Eligibility Screening
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
