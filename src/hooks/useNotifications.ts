import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import type { Notification, ApiResponse } from '../types';

interface NotificationsResponse {
  status: string;
  data: Notification[];
  total: number;
}

interface UnreadCountResponse {
  status: string;
  data: {
    count: number;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly: boolean = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<NotificationsResponse>(
        `/notifications${unreadOnly ? '?unreadOnly=true' : ''}`
      );
      setNotifications(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông báo';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return 0;
    }
    
    try {
      const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
      setUnreadCount(response.data.count);
      return response.data.count;
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      
      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đánh dấu thông báo đã đọc';
      setError(errorMessage);
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put<ApiResponse<{ updated: number }>>('/notifications/mark-all-read');
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đánh dấu tất cả thông báo đã đọc';
      setError(errorMessage);
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Don't auto-fetch on mount - let component control when to fetch based on auth state

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
