"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const mockRooms = [
    { id: '1', name: 'General Chat', participants: 12, lastMessage: 'Hello everyone!', unread: 2 },
    { id: '2', name: 'Photography', participants: 8, lastMessage: 'Great shot!', unread: 0 },
    { id: '3', name: 'Local Events', participants: 15, lastMessage: 'See you there', unread: 1 },
  ];

  const mockMessages = [
    { id: '1', sender: 'Alice', message: 'Hello everyone!', timestamp: '2:30 PM', isOwn: false },
    { id: '2', sender: 'You', message: 'Hi there!', timestamp: '2:31 PM', isOwn: true },
    { id: '3', sender: 'Bob', message: 'How is everyone doing?', timestamp: '2:32 PM', isOwn: false },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage("");
      // TODO: Implement message sending
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <p className="mt-2 text-gray-600">
          Connect with others through real-time messaging and chat rooms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Room List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chat Rooms</CardTitle>
              <Button size="sm">Create</Button>
            </div>
            <CardDescription>
              Join conversations and meet new people
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {mockRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedRoom === room.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{room.lastMessage}</p>
                      <p className="text-xs text-gray-400">{room.participants} participants</p>
                    </div>
                    {room.unread > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-1 ml-2">
                        {room.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          {selectedRoom ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="text-lg">
                  {mockRooms.find(r => r.id === selectedRoom)?.name}
                </CardTitle>
                <CardDescription>
                  {mockRooms.find(r => r.id === selectedRoom)?.participants} participants online
                </CardDescription>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {mockMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!msg.isOwn && (
                          <p className="text-xs font-medium mb-1 opacity-75">{msg.sender}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <span className="text-6xl mb-4 block">💬</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat room</h3>
                <p className="text-gray-600">
                  Choose a room from the list to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Room Management */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
          <CardDescription>
            Create and manage your chat rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Create New Room</h4>
              <div className="space-y-3">
                <Input placeholder="Room name" />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="public">Public Room</option>
                  <option value="private">Private Room</option>
                  <option value="group">Group Chat</option>
                </select>
                <Button className="w-full">Create Room</Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Chat Settings</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Show online status</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Allow direct messages</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="ml-2 text-sm text-gray-700">Mute notifications</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}