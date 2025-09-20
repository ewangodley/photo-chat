"use client";

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketClient } from '@/lib/socket/socketClient';
import { useAuth } from './useAuth';

export function useSocket(namespace: string = '') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userId) {
      const socketInstance = socketClient.connect(namespace, user.userId);
      setSocket(socketInstance);

      socketInstance.on('connect', () => setIsConnected(true));
      socketInstance.on('disconnect', () => setIsConnected(false));

      return () => {
        socketClient.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, namespace]);

  const emit = (event: string, data?: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    socket,
    isConnected,
    emit,
    on,
    off
  };
}