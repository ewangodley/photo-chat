"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { AuthManager } from "@/lib/auth/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Monitoring', href: '/admin/monitoring', icon: '🔍' },
  { name: 'Moderation', href: '/admin/moderation', icon: '🛡️' },
  { name: 'Reports', href: '/admin/reports', icon: '📋' },
];

export default function AdminLayout({
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
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
          <div className="flex h-16 items-center px-6">
            <div className="w-8 h-8 bg-primary rounded-lg mr-3"></div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              variant="outline" 
              className="w-full text-gray-300 border-gray-600 hover:bg-gray-700"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => pathname === item.href)?.name || 'Admin'}
              </h1>
            </div>
          </header>
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}