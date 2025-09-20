"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminMonitoringPage() {
  const [services, setServices] = useState([
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '45ms', lastCheck: '30s ago' },
    { name: 'Auth Service', status: 'healthy', uptime: '99.8%', responseTime: '32ms', lastCheck: '30s ago' },
    { name: 'User Service', status: 'healthy', uptime: '99.7%', responseTime: '28ms', lastCheck: '30s ago' },
    { name: 'Photo Service', status: 'warning', uptime: '98.5%', responseTime: '156ms', lastCheck: '30s ago' },
    { name: 'Chat Service', status: 'healthy', uptime: '99.9%', responseTime: '22ms', lastCheck: '30s ago' },
    { name: 'Admin Service', status: 'healthy', uptime: '99.6%', responseTime: '38ms', lastCheck: '30s ago' },
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkIn: '1.2 MB/s',
    networkOut: '0.8 MB/s',
    activeConnections: 1247
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 30) + 30,
        memoryUsage: Math.floor(Math.random() * 20) + 50,
        diskUsage: Math.floor(Math.random() * 10) + 75,
        activeConnections: Math.floor(Math.random() * 200) + 1200
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-gray-500">All systems running normally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeConnections}</div>
            <p className="text-xs text-green-600">+5% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">No active incidents</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Status</CardTitle>
          <CardDescription>
            Real-time monitoring of all microservices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{service.name}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>{service.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response:</span>
                    <span>{service.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span>{service.lastCheck}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
            <CardDescription>
              Current system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{systemMetrics.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(systemMetrics.cpuUsage)}`}
                  style={{ width: `${systemMetrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{systemMetrics.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(systemMetrics.memoryUsage)}`}
                  style={{ width: `${systemMetrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disk Usage</span>
                <span>{systemMetrics.diskUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(systemMetrics.diskUsage)}`}
                  style={{ width: `${systemMetrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Activity</CardTitle>
            <CardDescription>
              Real-time network traffic monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Network In</div>
                <div className="text-2xl font-bold text-blue-600">{systemMetrics.networkIn}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Network Out</div>
                <div className="text-2xl font-bold text-green-600">{systemMetrics.networkOut}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Active Connections</div>
              <div className="text-2xl font-bold">{systemMetrics.activeConnections}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              System alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-500">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">High response time detected</p>
                  <p className="text-xs text-gray-500">Photo Service - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <span className="text-green-500">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">System backup completed</p>
                  <p className="text-xs text-gray-500">Database - 1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-500">ℹ️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Scheduled maintenance reminder</p>
                  <p className="text-xs text-gray-500">System - Tomorrow 2:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Actions</CardTitle>
            <CardDescription>
              Administrative system controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                Restart Services
              </Button>
              <Button variant="outline" className="w-full">
                Clear Cache
              </Button>
              <Button variant="outline" className="w-full">
                Run Diagnostics
              </Button>
              <Button variant="outline" className="w-full">
                View Logs
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Maintenance Mode</h4>
              <p className="text-sm text-gray-600 mb-3">
                Enable maintenance mode to perform system updates
              </p>
              <Button variant="outline" className="w-full text-yellow-600 border-yellow-600">
                Enable Maintenance Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}