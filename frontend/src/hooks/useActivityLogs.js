import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../api/api.js';

// Single shared socket connection for the app
const socket = io('http://localhost:3000', {
    autoConnect: false,
    withCredentials: true,
});

export const useActivityLogs = (page = 1, limit = 10) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['activity-logs', page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/activity-logs?page=${page}&limit=${limit}`);
            return data;
        },
        keepPreviousData: true,
    });

    // Listen for real-time updates via WebSocket
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const handleNewLog = () => {
            // Invalidate all activity-logs queries so React Query refetches
            queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        };

        socket.on('new-activity-log', handleNewLog);

        return () => {
            socket.off('new-activity-log', handleNewLog);
        };
    }, [queryClient]);

    return query;
};
