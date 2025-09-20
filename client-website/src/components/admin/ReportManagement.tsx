"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  type: 'user' | 'photo' | 'chat';
  reportedBy: string;
  reportedUser: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export function ReportManagement() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      type: 'photo',
      reportedBy: 'user123',
      reportedUser: 'baduser456',
      reason: 'Inappropriate content',
      description: 'Photo contains inappropriate material',
      status: 'pending',
      createdAt: '2024-01-20T10:30:00Z',
      priority: 'high'
    },
    {
      id: '2',
      type: 'user',
      reportedBy: 'user789',
      reportedUser: 'spammer123',
      reason: 'Spam/Harassment',
      description: 'User is sending spam messages repeatedly',
      status: 'investigating',
      createdAt: '2024-01-20T09:15:00Z',
      priority: 'medium'
    },
  ]);

  const handleResolve = (reportId: string) => {
    console.log(`Resolving report ${reportId}`);
    // TODO: Implement API call
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Management</CardTitle>
        <CardDescription>
          Review and resolve user reports and complaints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                    {report.priority} priority
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {report.type} report
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Reported User</div>
                  <div className="text-sm text-gray-900">@{report.reportedUser}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Reported By</div>
                  <div className="text-sm text-gray-900">@{report.reportedBy}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Reason</div>
                <div className="text-sm text-gray-900">{report.reason}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                <div className="text-sm text-gray-900">{report.description}</div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleResolve(report.id)}>
                  Investigate
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Contact Reporter
                </Button>
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">📋</span>
            <p>No pending reports</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}