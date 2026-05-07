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

    const queryAll = useQuery({
        queryKey: ['products', 'all'],
        queryFn: async () => {
            const { data } = await api.get('/products/show-hidden');
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
            return api.post('/products', newProduct, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const updateImageMutation = useMutation({
        mutationFn: async ({ productId, formData }) => {
            console.log("im here");
            return api.patch(`/products/${productId}/image`, formData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    })

    return { query, queryAll, updateMutation, insertMutation, updateImageMutation };
}