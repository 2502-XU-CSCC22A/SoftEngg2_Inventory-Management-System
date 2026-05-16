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
            try {
                const { data } = await api.patch(`/products/${product_id}`, payload);
                return data;
            }
            catch (error) {
                if (error.response && error.response.data.errors) {
                    throw new Error(error.response.data.errors.map(e => e.message).join(", "));
                }
                else {
                    throw new Error(error.response.data.message || "Something went wrong.");
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            alert(`Error: ${error.message}`)
        }
    });

    const insertMutation = useMutation({
        mutationFn: async (newProduct) => {
            try {
                const { data } = await api.post('/products', newProduct, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                return data;
            }
            catch (error) {
                if (error.response && error.response.data.errors) {
                    throw new Error(error.response.data.errors.map(e => e.message).join(", "));
                }
                else {
                    throw new Error(error.response.data.message || "Something went wrong.");
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            alert(`Error: ${error.message}`)
        }
    });

    const updateImageMutation = useMutation({
        mutationFn: async ({ productId, formData }) => {
            try {
                const { data } = await api.patch(`/products/${productId}/image`, formData);
                return data;
            }
            catch (error) {
                if (error.response && error.response.data.errors) {
                    throw new Error(error.response.data.errors.map(e => e.message).join(", "));
                }
                else {
                    throw new Error(error.response.data.message || "Something went wrong.");
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
            alert(`Error: ${error.message}`)
        }
    })

    return { query, updateMutation, insertMutation, updateImageMutation };
}