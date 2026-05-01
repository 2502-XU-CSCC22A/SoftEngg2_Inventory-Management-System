import { useQuery } from '@tanstack/react-query';
import api from '../api/api.js';

export const useTransactions = () => {
    const query = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => { 
            const { data } = await api.get('/transactions'); 
            return data;
        },
        onError: (error) => {
            console.error("Error fetching transactions:", error);
        },
    });

    const queryAll = useQuery({
        queryKey: ['transactions', 'all'],
        queryFn: async () => {
            const { data } = await api.get('/transactions/show-all');
            return data;
        },
        onError: (error) => {
            console.error("Error fetching all transactions:", error);   
        },
    });
    return { query, queryAll };
};