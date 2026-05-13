import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/api.js';

export const useTransactions = (month = null, year = null, status = null) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['transactions', { month, year, status }],
        queryFn: async () => {
            let endpoint;
            if (month && year) {
                // Enhancement: pass optional status filter to the backend.
                // If status is null, the backend returns all statuses (existing behavior).
                const statusParam = status ? `&status=${status}` : '';
                endpoint = `/transactions/filter?month=${month}&year=${year}${statusParam}`;
            } else {
                endpoint = '/transactions';
            }

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
    });

    // Enhancement: dedicated mutation for updating only the transaction status.
    // Used by the "Mark as Completed" and "Cancel Order" actions in the Sales page.
    const updateStatusMutation = useMutation({
        mutationFn: async ({ transaction_id, status: newStatus }) => {
            try {
                const { data } = await api.patch(`/transactions/${transaction_id}/status`, { status: newStatus });
                return data;
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw new Error(error.response.data.message || "Something went wrong.");
                }
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        }
    });

    return { query, queryAll, updateMutation, insertMutation, updateStatusMutation };
};