import { useQuery } from '@tanstack/react-query';
import api from "../api/api.js";

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        }
    })
}