import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/api.js';

export const useTransactions = () => {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const { data } = await api.get('/transactions');
            return data;
        }
    });

    const queryAll = useQuery({
        queryKey: ['transactions', 'all'],
        queryFn: async () => {
            const { data } = await api.get('/transactions/show-all');
            return data;
        }
    });

    const queryByMonthAndYear = useQuery({
        queryKey: ['transactions', 'filter'],
        queryFn: async ({ queryKey }) => {
            const [, , { month, year }] = queryKey;
            const { data } = await api.get(`/transactions/filter?month=${month}&year=${year}`);
            return data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ transaction_id, ...payload }) => {
            return api.patch(`/transactions/${transaction_id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
    });

    const insertMutation = useMutation({
        mutationFn: async (newTransaction) => {
            return api.post('/transactions', newTransaction);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
    })

    return { query, queryAll, queryByMonthAndYear, updateMutation, insertMutation }
};