"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Photo {
  photoId: string;
  url: string;
  userId: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  caption?: string;
}

export function PhotoModerationQueue() {
  const [photos] = useState<Photo[]>([
    {
      photoId: '1',
      url: '/api/placeholder/300/200',
      userId: 'user1',
      username: 'alice_doe',
      status: 'pending',
      uploadedAt: '2024-01-20T10:30:00Z',
      caption: 'Beautiful sunset at the beach'
    },
    {
      photoId: '2',
      url: '/api/placeholder/300/200',
      userId: 'user2',
      username: 'bob_smith',
      status: 'pending',
      uploadedAt: '2024-01-20T09:15:00Z',
      caption: 'City skyline view'
    },
  ]);

  const handleModerate = (photoId: string, action: 'approve' | 'reject') => {
    console.log(`${action} photo ${photoId}`);
    // TODO: Implement API call
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Moderation Queue</CardTitle>
        <CardDescription>
          Review and moderate user-uploaded photos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.photoId} className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">📷 Photo Preview</span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">@{photo.username}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                {photo.caption && (
                  <p className="text-sm text-gray-600 mb-3">{photo.caption}</p>
                )}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleModerate(photo.photoId, 'approve')}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleModerate(photo.photoId, 'reject')}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {photos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-4 block">✅</span>
            <p>No photos pending moderation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}