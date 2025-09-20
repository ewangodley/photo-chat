"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PhotosPage() {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      console.log('Files to upload:', imageFiles);
      // TODO: Implement file upload
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Photos</h1>
        <p className="mt-2 text-gray-600">
          Share your moments with location-based photo sharing.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>
            Share photos with your current location. Photos expire after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop photos here or click to upload
            </h3>
            <p className="text-gray-600 mb-4">
              Supports JPG, PNG, GIF up to 10MB each
            </p>
            <Button>
              Choose Files
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Location Required</p>
                <p>Photos will be tagged with your current location. Make sure location services are enabled.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Photos */}
        <Card>
          <CardHeader>
            <CardTitle>My Photos</CardTitle>
            <CardDescription>
              Photos you've shared recently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">🖼️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-600">
                Upload your first photo to get started
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Nearby Photos</CardTitle>
            <CardDescription>
              Photos shared by others in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <span className="text-6xl mb-4 block">🗺️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No nearby photos</h3>
              <p className="text-gray-600">
                Enable location to discover photos around you
              </p>
              <Button variant="outline" className="mt-4">
                Enable Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Management */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Photo Management</CardTitle>
          <CardDescription>
            Manage your photo settings and privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Privacy Settings</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Allow others to see my photos</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Include location in photos</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="ml-2 text-sm text-gray-700">Allow photo downloads</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Auto-Delete</h4>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="30">30 days (default)</option>
                <option value="7">7 days</option>
                <option value="1">1 day</option>
                <option value="0">Never delete</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Photos will be automatically deleted after this period
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}