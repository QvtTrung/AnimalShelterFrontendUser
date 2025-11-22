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
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const response = await apiClient.get<ApiResponse<Rescue[]>>(
        `/rescues?${params.toString()}`
      );
      return response; // Return full response with meta
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

export const useStartRescue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rescueId: string) =>
      apiClient.post<ApiResponse<void>>(`/rescues/${rescueId}/start`),
    onSuccess: (_, rescueId) => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['rescue', rescueId] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
    },
  });
};

export const useCancelRescue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rescueId, reason }: { rescueId: string; reason?: string }) =>
      apiClient.post<ApiResponse<void>>(`/rescues/${rescueId}/cancel`, { reason }),
    onSuccess: (_, { rescueId }) => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['rescue', rescueId] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
    },
  });
};

export const useCompleteRescue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rescueId: string) =>
      apiClient.post<ApiResponse<void>>(`/rescues/${rescueId}/complete`),
    onSuccess: (_, rescueId) => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['rescue', rescueId] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useUpdateReportProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rescueReportId, status, note }: { 
      rescueReportId: string; 
      status: 'in_progress' | 'success' | 'cancelled'; 
      note?: string;
    }) =>
      apiClient.patch<ApiResponse<void>>(`/rescues/reports/${rescueReportId}/progress`, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
      queryClient.invalidateQueries({ queryKey: ['rescue'] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
    },
  });
};
