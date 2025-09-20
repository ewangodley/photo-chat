"use client";

import { PhotoModerationQueue } from "@/components/admin/PhotoModerationQueue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      {/* Moderation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-yellow-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-green-600">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-red-600">Policy violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Review Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3m</div>
            <p className="text-xs text-gray-500">Per photo</p>
          </CardContent>
        </Card>
      </div>

      {/* Photo Moderation Queue */}
      <PhotoModerationQueue />

      {/* Moderation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Settings</CardTitle>
          <CardDescription>
            Configure content moderation policies and automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Auto-Moderation</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  <span className="ml-2 text-sm">Enable AI content detection</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  <span className="ml-2 text-sm">Auto-reject explicit content</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="ml-2 text-sm">Flag suspicious uploads</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Review Thresholds</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Confidence Threshold</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="75"
                    className="w-full mt-1"
                  />
                  <div className="text-xs text-gray-500">75% confidence</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Queue Priority</label>
                  <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                    <option>Newest first</option>
                    <option>Oldest first</option>
                    <option>High risk first</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex space-x-3">
              <Button>Save Settings</Button>
              <Button variant="outline">Reset to Default</Button>
              <Button variant="outline">Export Rules</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}