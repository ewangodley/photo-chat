"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { AuthManager } from "@/lib/auth/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Profile', href: '/profile', icon: '👤' },
  { name: 'Photos', href: '/photos', icon: '📸' },
  { name: 'Chat', href: '/chat', icon: '💬' },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = () => {
    AuthManager.clearAuth();
    window.location.href = '/';
  };

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200" role="navigation" aria-label="User navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center px-4">
                  <div className="w-8 h-8 bg-primary rounded-lg mr-2"></div>
                  <span className="text-xl font-bold text-gray-900">Phone App</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                        pathname === item.href
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                    pathname === item.href
                      ? "bg-primary-50 border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}