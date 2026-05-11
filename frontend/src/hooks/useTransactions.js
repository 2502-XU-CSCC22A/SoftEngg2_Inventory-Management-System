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
            try {
                const { data } = await api.patch(`/transactions/${transaction_id}`, payload);
                return data;
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message || "Something went wrong.");
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            alert(`Error: ${error.message}`)
        }
    });

    const insertMutation = useMutation({
        mutationFn: async (newTransaction) => {
            try {
                const { data } = await api.post('/transactions', newTransaction);
                return data;
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message || "Something went wrong.");
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products']});
        },
        onError: (error) => {
            alert(`Error: ${error.message}`)
        }
    })

    return { query, queryAll, updateMutation, insertMutation }
};