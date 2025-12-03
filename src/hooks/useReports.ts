import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Report } from '../types';

interface ReportFilters {
  status?: string;
  urgency_level?: string;
  reporter_id?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const useReports = (filters?: ReportFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      const response = await apiClient.get<ApiResponse<Report[]>>(
        `/reports?${params.toString()}`
      );
      return response; // Return full response with meta
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
    mutationFn: (data: Partial<Report> | FormData) => {
      // Check if data is FormData (for multipart/form-data with images)
      if (data instanceof FormData) {
        // Don't set Content-Type header - let browser set it with boundary
        // The API client will handle auth token automatically
        return apiClient.post<ApiResponse<Report>>('/reports', data);
      }

      // Otherwise, send as JSON (for reports without images)
      const reportData = {
        ...data,
        status: (data as Partial<Report>).status || 'pending',
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
    staleTime: 0, // Always refetch on mount to prevent stale data on login/logout
  });
};
