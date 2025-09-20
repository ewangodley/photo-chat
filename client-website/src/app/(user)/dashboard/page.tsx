"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthManager } from "@/lib/auth/auth";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(AuthManager.getUser());

  useEffect(() => {
    // Refresh user data on mount
    const userData = AuthManager.getUser();
    setUser(userData);
  }, []);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos Shared</CardTitle>
            <span className="text-2xl">📸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">No photos uploaded yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">No messages yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Rooms</CardTitle>
            <span className="text-2xl">🏠</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Join or create rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <span className="text-2xl">🔔</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">All caught up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Complete your profile and start connecting with others
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Complete your profile</span>
              <Link href="/profile">
                <Button size="sm">Update Profile</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Share your first photo</span>
              <Link href="/photos">
                <Button size="sm" variant="outline">Upload Photo</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Join a chat room</span>
              <Link href="/chat">
                <Button size="sm" variant="outline">Start Chatting</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">🌟</span>
              <p>No recent activity</p>
              <p className="text-sm">Start sharing photos or chatting to see activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-sm text-gray-900">{user?.username || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{user?.email || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-sm text-gray-900 capitalize">{user?.role || 'User'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Member Since</label>
              <p className="text-sm text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link href="/profile">
              <Button>Manage Profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}