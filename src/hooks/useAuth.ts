import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse, User } from '../types';
import { useAuthStore } from '../store/auth.store';
import type { AxiosError } from 'axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
}

interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
}

interface AuthResponse {
  directusUser: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  user: User | null; // This is the AppUser from backend
  token: string;
  refresh_token: string;
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),
    onSuccess: (response) => {
      const { user, directusUser, token, refresh_token } = response.data;
      // Use AppUser if available, otherwise fall back to directusUser
      const userData: User = user || {
        id: directusUser.id,
        email: directusUser.email,
        first_name: directusUser.first_name || '',
        last_name: directusUser.last_name || '',
      };
      setAuth(userData, token, refresh_token);
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),
    onSuccess: (response) => {
      const { user, directusUser, token, refresh_token } = response.data;
      // Use AppUser if available, otherwise fall back to directusUser
      const userData: User = user || {
        id: directusUser.id,
        email: directusUser.email,
        first_name: directusUser.first_name || '',
        last_name: directusUser.last_name || '',
      };
      setAuth(userData, token, refresh_token);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<ApiResponse<void>>('/auth/logout'),
    onSuccess: () => {
      logout();
      // Clear all React Query cache to prevent showing old user's data
      queryClient.clear();
    },
    onError: () => {
      // Logout even if API call fails
      logout();
      // Clear cache even on error
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<{
          directusUser: {
            id: string;
            email: string;
            first_name?: string;
            last_name?: string;
          };
          user: User | null;
        }>>('/auth/me');
        
        // Transform response to return the AppUser or directusUser
        const { user, directusUser } = response.data;
        const userData: User = user || {
          id: directusUser.id,
          email: directusUser.email,
          first_name: directusUser.first_name || '',
          last_name: directusUser.last_name || '',
        };
        
        return { ...response, data: userData };
      } catch (error) {
        // If we get a 401 error, logout the user
        if ((error as AxiosError)?.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    enabled: isAuthenticated && !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiClient.patch<ApiResponse<User>>('/users/me', data),
    onSuccess: (response) => {
      // Update the store with the new user data
      updateUser(response.data);
      // Invalidate and refetch the current user query
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
};
