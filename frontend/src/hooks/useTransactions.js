import { useQuery } from '@tanstack/react-query';
import api from '../api/api.js';

export const useTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const { data } = await api.get('/transactions');
            return data;
        },
    });
};