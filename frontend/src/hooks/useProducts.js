import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../api/api.js";

export const useProducts = (is_still_offered = undefined) => {
    // unified products query
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['products', { is_still_offered }],
        queryFn: async () => {
            const endpoint = (is_still_offered !== undefined) 
                ? `products?is_still_offered=${is_still_offered}`
                : `products`
            const { data } = await api.get(endpoint);
            return data;
        }
    })

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

    return { query, updateMutation, insertMutation, updateImageMutation };
}