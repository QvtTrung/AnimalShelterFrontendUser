import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Report, PaginatedResponse } from '../types';

interface ReportFilters {
  status?: string;
  urgency_level?: string;
  reporter_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useReports = (filters?: ReportFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      return apiClient.get<ApiResponse<PaginatedResponse<Report>>>(
        `/reports?${params.toString()}`
      );
    },
    enabled: options?.enabled !== false,
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => apiClient.get<ApiResponse<Report>>(`/reports/${id}`),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Report>) => {
      // Ensure coordinates are properly formatted
      const reportData = {
        ...data,
        status: data.status || 'pending',
      };
      return apiClient.post<ApiResponse<Report>>('/reports', reportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useClaimReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) =>
      apiClient.post<ApiResponse<void>>(`/reports/${reportId}/claim`),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['my-rescues'] });
    },
  });
};

export const useMyReports = () => {
  return useQuery({
    queryKey: ['my-reports'],
    queryFn: () => apiClient.get<ApiResponse<Report[]>>('/reports/me'),
  });
};
