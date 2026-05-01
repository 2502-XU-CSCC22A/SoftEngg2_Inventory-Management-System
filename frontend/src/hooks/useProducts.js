import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../api/api.js";

export const useProducts = () => {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get('/products');
            return data;
        }
    });

    // The Updater (Mutation)
    const updateMutation = useMutation({
        mutationFn: async ({ product_id, ...payload }) => {
            return api.patch(`/products/${product_id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const insertMutation = useMutation({
        mutationFn: async (newProduct) => {
            return api.post('/products', newProduct);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    return { ...query, updateMutation, insertMutation };
}