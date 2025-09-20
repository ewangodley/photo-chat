"use client";

import { ReportManagement } from "@/components/admin/ReportManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Reports Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-yellow-600">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-green-600">+3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">Urgent review needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-gray-500">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Management */}
      <ReportManagement />

      {/* Report Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Categories</CardTitle>
            <CardDescription>
              Distribution of report types this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Inappropriate Content</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Spam/Harassment</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Copyright Violation</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Actions</CardTitle>
            <CardDescription>
              Quick actions for report management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                Bulk Review
              </Button>
              <Button variant="outline" className="w-full">
                Export Reports
              </Button>
              <Button variant="outline" className="w-full">
                Send Warnings
              </Button>
              <Button variant="outline" className="w-full">
                Generate Report
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Auto-Resolution</h4>
              <p className="text-sm text-gray-600 mb-3">
                Configure automatic resolution for common report types
              </p>
              <Button variant="outline" className="w-full">
                Configure Rules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}