import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Rescue, PaginatedResponse } from '../types';

interface RescueFilters {
  status?: string;
  volunteer_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useRescues = (filters?: RescueFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['rescues', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      return apiClient.get<ApiResponse<PaginatedResponse<Rescue>>>(
        `/rescues?${params.toString()}`
      );
    },
    enabled: options?.enabled !== false,
  });
};

export const useRescue = (id: string) => {
  return useQuery({
    queryKey: ['rescue', id],
    queryFn: () => apiClient.get<ApiResponse<Rescue>>(`/rescues/${id}`),
    enabled: !!id,
  });
};

export const useCreateRescue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Rescue>) =>
      apiClient.post<ApiResponse<Rescue>>('/rescues', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
    },
  });
};

export const useJoinRescue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rescueId: string) =>
      apiClient.post<ApiResponse<void>>(`/rescues/${rescueId}/join`),
    onSuccess: (_, rescueId) => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['rescue', rescueId] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
    },
  });
};

export const useLeaveRescue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rescueId: string) =>
      apiClient.post<ApiResponse<void>>(`/rescues/${rescueId}/leave`),
    onSuccess: (_, rescueId) => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['rescue', rescueId] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
    },
  });
};

export const useMyRescues = () => {
  return useQuery({
    queryKey: ['my-rescues'],
    queryFn: () => apiClient.get<ApiResponse<Rescue[]>>('/rescues/me'),
  });
};
