import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3002';

let socket: Socket | null = null;

export function getSocket(profileId: string): Socket {
  if (socket?.connected) return socket;

  const token = typeof window !== 'undefined' ? localStorage.getItem('mn_token') : null;

  socket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    query: { profileId },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('[Socket] Connected:', socket?.id));
  socket.on('disconnect', () => console.log('[Socket] Disconnected'));
  socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
