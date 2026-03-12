import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { getServerOrigin } from '@/config/api';

/** Derive WebSocket server URL from API base URL */
const getWsUrl = (): string => getServerOrigin();

export type RealtimeEvent = 'notification_new' | 'booking_updated' | 'feed_updated';

export interface RealtimeContextValue {
  connected: boolean;
  subscribe: (event: RealtimeEvent, handler: (payload: unknown) => void) => () => void;
  joinFeed: () => void;
  leaveFeed: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime(): RealtimeContextValue | null {
  return useContext(RealtimeContext);
}

interface RealtimeProviderProps {
  children: React.ReactNode;
  token: string | null;
  pollIntervalMs?: number;
}

export function RealtimeProvider({
  children,
  token,
  pollIntervalMs = 60000,
}: RealtimeProviderProps) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<RealtimeEvent, Set<(p: unknown) => void>>>(new Map());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emitToHandlers = useCallback((event: RealtimeEvent, payload: unknown) => {
    handlersRef.current.get(event)?.forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        console.warn('Realtime handler error', event, e);
      }
    });
  }, []);

  useEffect(() => {
    if (!token?.trim()) {
      setConnected(false);
      return;
    }

    let active = true;
    const url = getWsUrl();
    const timeoutId = setTimeout(() => {
      if (!active) return;
      const socket = io(url, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        if (!active) return;
        setConnected(true);
      });
      socket.on('disconnect', () => setConnected(false));

      socket.on('notification_new', (payload) => {
        emitToHandlers('notification_new', payload);
      });

      socket.on('booking_updated', (payload) => {
        emitToHandlers('booking_updated', payload);
      });

      socket.on('feed_updated', (payload) => {
        emitToHandlers('feed_updated', payload);
      });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      const socket = socketRef.current;
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [token, emitToHandlers]);

  useEffect(() => {
    if (!token || pollIntervalMs <= 0 || connected) return;

    const tick = () => emitToHandlers('notification_new', { refresh: true });
    pollIntervalRef.current = setInterval(tick, pollIntervalMs);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [token, pollIntervalMs, connected, emitToHandlers]);

  const subscribe = useCallback((event: RealtimeEvent, handler: (payload: unknown) => void) => {
    const set = handlersRef.current.get(event) ?? new Set();
    set.add(handler);
    handlersRef.current.set(event, set);
    return () => {
      set.delete(handler);
      if (set.size === 0) handlersRef.current.delete(event);
    };
  }, []);

  const joinFeed = useCallback(() => {
    socketRef.current?.emit('join_feed');
  }, []);

  const leaveFeed = useCallback(() => {
    socketRef.current?.emit('leave_feed');
  }, []);

  const value: RealtimeContextValue = {
    connected,
    subscribe,
    joinFeed,
    leaveFeed,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
