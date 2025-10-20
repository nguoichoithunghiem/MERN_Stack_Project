// src/hooks/useOrderNotification.ts
import { useEffect, useState } from 'react';
import config from '../config.json'; // import config
import { io, type Socket } from 'socket.io-client';

let socket: Socket;

export const useOrderNotification = () => {
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    useEffect(() => {
        socket = io(`${config.API_BASE_URL}`); // backend URL

        socket.on('orderCreated', (order) => {
            console.log('Có đơn hàng mới:', order);
            setNewOrdersCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const resetCount = () => setNewOrdersCount(0);

    return { newOrdersCount, resetCount };
};
