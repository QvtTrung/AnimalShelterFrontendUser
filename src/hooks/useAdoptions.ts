import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Adoption, PaginatedResponse } from '../types';

interface AdoptionFilters {
  status?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export const useAdoptions = (filters?: AdoptionFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['adoptions', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      return apiClient.get<ApiResponse<PaginatedResponse<Adoption>>>(
        `/adoptions?${params.toString()}`
      );
    },
    enabled: options?.enabled !== false,
  });
};

export const useAdoption = (id: string) => {
  return useQuery({
    queryKey: ['adoption', id],
    queryFn: () => apiClient.get<ApiResponse<Adoption>>(`/adoptions/${id}`),
    enabled: !!id,
  });
};

export const useCreateAdoption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { pet_id: string; notes?: string }) =>
      apiClient.post<ApiResponse<Adoption>>('/adoptions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptions'] });
      queryClient.invalidateQueries({ queryKey: ['my-adoptions'] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useCancelAdoption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<ApiResponse<Adoption>>(`/adoptions/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['adoptions'] });
      queryClient.invalidateQueries({ queryKey: ['adoption', id] });
      queryClient.invalidateQueries({ queryKey: ['my-adoptions'] });
    },
  });
};

export const useMyAdoptions = () => {
  return useQuery({
    queryKey: ['my-adoptions'],
    queryFn: () => apiClient.get<ApiResponse<Adoption[]>>('/adoptions/me'),
    staleTime: 0, // Always refetch on mount to prevent stale data on login/logout
  });
};
