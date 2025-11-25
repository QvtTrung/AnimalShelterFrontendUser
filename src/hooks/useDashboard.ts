import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, Report } from '../types';

interface DashboardStats {
  adoptions: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
  };
  reports: {
    total: number;
    pending: number;
    assigned: number;
    resolved: number;
  };
  rescues: {
    total: number;
    planned: number;
    in_progress: number;
    completed: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'adoption' | 'report' | 'rescue';
  title: string;
  description: string;
  date: string;
  status: string;
}

interface NearbyReport extends Report {
  distance_meters: number;
  distance_km: string;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data;
    },
    staleTime: 0, // Always refetch on mount
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecentActivity[]>>('/dashboard/activity');
      return response.data;
    },
    staleTime: 0, // Always refetch on mount
  });
};

export const useNearbyReports = (coordinates?: { latitude: number; longitude: number }, radius: number = 25000, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['nearby-reports', coordinates, radius],
    queryFn: async () => {
      let url = `/dashboard/nearby-reports?radius=${radius}`;
      if (coordinates) {
        url += `&latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;
      }
      const response = await apiClient.get<ApiResponse<NearbyReport[]>>(url);
      return response.data;
    },
    enabled: enabled && !!coordinates, // Only fetch when explicitly enabled and coordinates are available
    staleTime: 0, // Always refetch on mount
  });
};
