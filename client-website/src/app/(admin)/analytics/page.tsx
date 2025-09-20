"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalyticsPage() {
  // User Analytics Data
  const userChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 59, 80, 81, 56, 95],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Active Users',
        data: [28, 48, 40, 19, 86, 127],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Photo Moderation Data
  const photoChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [300, 50, 25],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Reports Timeline Data
  const reportsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Reports Received',
        data: [12, 19, 3, 5, 2, 3, 7],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Reports Resolved',
        data: [10, 15, 8, 12, 6, 4, 9],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-green-600">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-green-600">+0.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4m 32s</div>
            <p className="text-xs text-red-600">-12s from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.3%</div>
            <p className="text-xs text-green-600">-2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Analytics</CardTitle>
            <CardDescription>
              User registration and activity trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={userChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photo Moderation</CardTitle>
            <CardDescription>
              Distribution of photo moderation status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pie 
              data={photoChartData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Reports Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Timeline</CardTitle>
          <CardDescription>
            Weekly report submission and resolution trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Bar data={reportsChartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Export and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Export analytics data for external analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">User analytics (CSV)</span>
              <Button size="sm" variant="outline">Export</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Photo statistics (PDF)</span>
              <Button size="sm" variant="outline">Export</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Full report (Excel)</span>
              <Button size="sm" variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
            <CardDescription>
              Configure automated reporting preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Frequency</label>
              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Email Recipients</label>
              <input 
                type="email" 
                placeholder="admin@example.com"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <Button className="w-full">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}