import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, { transports: ['websocket', 'polling'], reconnectionDelay: 1000, reconnectionAttempts: 5 });
    socket.on('connect',       () => console.log('🔌 Socket connected:', socket.id));
    socket.on('disconnect',    () => console.log('🔌 Socket disconnected'));
    socket.on('connect_error', (e) => console.error('Socket error:', e.message));
  }
  return socket;
};

export const getSocket       = () => socket;
export const disconnectSocket = () => { if (socket) { socket.disconnect(); socket = null; } };
export const joinDoctorRoom  = (id)           => socket?.emit('joinDoctorRoom', id);
export const joinQueueRoom   = (id, date)     => socket?.emit('joinQueueRoom', { doctorId: id, date });
export const joinPatientRoom = (id)           => socket?.emit('joinPatientRoom', id);
export const joinAdminRoom   = ()             => socket?.emit('joinAdminRoom');

export default { initSocket, getSocket, disconnectSocket, joinDoctorRoom, joinQueueRoom, joinPatientRoom, joinAdminRoom };