import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/api.js';

export const useTransactions = (month = null, year = null) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['transactions', { month, year }],
        queryFn: async () => {
            const endpoint = (month && year)
                ? `/transactions/filter?month=${month}&year=${year}`
                : '/transactions';

            const { data } = await api.get(endpoint);
            return data;
        },
        placeholderData: (previousData) => previousData,
    });

    const queryAll = useQuery({
        queryKey: ['transactions', 'all', { month, year }],
        queryFn: async () => {
            const endpoint = (month && year)
                ? `/transactions/show-all/filter?month=${month}&year=${year}`
                : '/transactions/show-all';
            const { data } = await api.get(endpoint);
            return data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ transaction_id, ...payload }) => {
            return api.patch(`/transactions/${transaction_id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });

    const insertMutation = useMutation({
        mutationFn: async (newTransaction) => {
            return api.post('/transactions', newTransaction);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products']});
        }
    })

    return { query, queryAll, updateMutation, insertMutation }
};