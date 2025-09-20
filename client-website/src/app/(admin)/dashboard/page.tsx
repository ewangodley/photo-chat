"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalPhotos: 0,
    pendingReports: 0,
    systemLoad: 0
  });

  useEffect(() => {
    // Simulate real-time metrics
    const interval = setInterval(() => {
      setMetrics({
        activeUsers: Math.floor(Math.random() * 100) + 50,
        totalPhotos: Math.floor(Math.random() * 1000) + 500,
        pendingReports: Math.floor(Math.random() * 10),
        systemLoad: Math.floor(Math.random() * 30) + 20
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-green-600">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <span className="text-2xl">📸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPhotos}</div>
            <p className="text-xs text-green-600">+5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingReports}</div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemLoad}%</div>
            <p className="text-xs text-green-600">Normal operation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Review pending reports</span>
              <Button size="sm">Review ({metrics.pendingReports})</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Moderate photos</span>
              <Button size="sm" variant="outline">Moderate</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System maintenance</span>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Export analytics</span>
              <Button size="sm" variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Gateway</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Service</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chat Service</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Photo Service</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Warning</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registration</p>
                <p className="text-xs text-gray-500">user@example.com registered 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-yellow-500">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Photo reported</p>
                <p className="text-xs text-gray-500">Photo ID #1234 reported for inappropriate content</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✅</span>
              <div className="flex-1">
                <p className="text-sm font-medium">System backup completed</p>
                <p className="text-xs text-gray-500">Daily backup finished successfully</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500">📊</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Analytics report generated</p>
                <p className="text-xs text-gray-500">Weekly report available for download</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}