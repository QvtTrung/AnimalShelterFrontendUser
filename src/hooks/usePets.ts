import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Pet, PaginatedResponse } from '../types';

interface PetFilters {
  species?: string;
  size?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const usePets = (filters?: PetFilters) => {
  return useQuery({
    queryKey: ['pets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get<ApiResponse<Pet[]>>(
        `/pets?${params.toString()}`
      );
      
      return response;
    },
  });
};

export const usePet = (id: string) => {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: () => apiClient.get<ApiResponse<Pet>>(`/pets/${id}`),
    enabled: !!id,
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pet>) =>
      apiClient.post<ApiResponse<Pet>>('/pets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pet> }) =>
      apiClient.put<ApiResponse<Pet>>(`/pets/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', variables.id] });
    },
  });
};
