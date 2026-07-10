import { io } from 'socket.io-client';

export const socket = io({
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export function emitAction(event, payload) {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res) => {
      if (res?.ok) resolve(res);
      else reject(new Error(res?.message || 'Something went wrong'));
    });
  });
}
