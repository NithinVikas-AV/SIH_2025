import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the server
    const newSocket = io("http://localhost:3001"); // Your server URL
    setSocket(newSocket);

    // Tell the server this user is online
    if (userId) {
      newSocket.emit("go-online", userId);
    }

    return () => newSocket.close();
  }, [userId]);

  return socket;
};