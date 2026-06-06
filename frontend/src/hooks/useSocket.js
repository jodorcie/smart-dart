import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useDartStore from '../store/dartStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export default function useSocket() {
  const socketRef = useRef(null);
  const { setInit, updateBuses, updateStationArrivals, setConnectionStatus } = useDartStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect',    () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('error'));

    socket.on('init',           (data)     => setInit(data));
    socket.on('busesUpdate',    (payloads) => updateBuses(payloads));
    socket.on('stationArrivals',(arrivals) => updateStationArrivals(arrivals));

    return () => socket.disconnect();
  }, []);

  return socketRef;
}
