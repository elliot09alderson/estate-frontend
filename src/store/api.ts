import { createApi } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import api from '../lib/axios';
import { AxiosError, AxiosRequestConfig } from 'axios';

// Custom base query using axios
const axiosBaseQuery = (
  { baseUrl }: { baseUrl: string } = { baseUrl: '' }
): BaseQueryFn<
  {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    headers?: AxiosRequestConfig['headers'];
  },
  unknown,
  unknown
> =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await api({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// Property Types (from your existing api.ts)
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'flat' | 'land' | 'shop' | 'house';
  listingType: 'sale' | 'rent';
  type?: 'sale' | 'rent';
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  address: string;
  images: string[];
  agentId: string;
  agentName: string;
  agentPhone: string;
  features: string[];
  isActive: boolean;
  isApproved?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isFeatured: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'agent' | 'admin';
  isActive: boolean;
  favorites: string[];
  createdAt: string;
  licenseNumber?: string;
  companyName?: string;
}

export interface Agent extends User {
  licenseNumber: string;
  companyName: string;
  properties: Property[];
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  propertyId?: string;
  subject: string;
  message: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'property' | 'feedback';
  targetId: string;
  targetName?: string;
  description: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Filters and pagination interfaces
export interface PropertyFilters {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
}

export interface PaginationResponse<T> {
  data?: T[];
  properties?: Property[];
  users?: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProperties?: number;
    totalUsers?: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Create the main API slice
export const realEstateApi = createApi({
  reducerPath: 'realEstateApi',
  baseQuery: axiosBaseQuery({ baseUrl: '' }),
  tagTypes: ['Property', 'User', 'Auth', 'Favorites', 'Analytics', 'Feedback', 'Activity'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<
      { message: string; token: string; user: User },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<
      { message: string; token: string; user: User },
      {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role?: 'user' | 'agent';
        licenseNumber?: string;
        companyName?: string;
      }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    getProfile: builder.query<{ user: User }, void>({
      query: () => ({
        url: '/auth/profile',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<
      { message: string; user: User },
      Partial<User>
    >({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Property endpoints
    getProperties: builder.query<PaginationResponse<Property>, PropertyFilters>({
      query: (filters = {}) => ({
        url: '/properties',
        method: 'GET',
        params: filters,
      }),
      providesTags: (result) =>
        result?.properties
          ? [
              ...result.properties.map(({ id }) => ({ type: 'Property' as const, id })),
              'Property',
            ]
          : ['Property'],
    }),

    getProperty: builder.query<{ property: Property }, string>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Property', id }],
    }),

    createProperty: builder.mutation<
      { message: string; property: Property },
      Partial<Property>
    >({
      query: (propertyData) => ({
        url: '/properties',
        method: 'POST',
        data: propertyData,
      }),
      invalidatesTags: ['Property'],
    }),

    updateProperty: builder.mutation<
      { message: string; property: Property },
      { id: string; data: Partial<Property> }
    >({
      query: ({ id, data }) => ({
        url: `/properties/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Property', id },
        'Property',
      ],
    }),

    deleteProperty: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property'],
    }),

    uploadPropertyImages: builder.mutation<
      { message: string; images: string[] },
      FormData
    >({
      query: (formData) => ({
        url: '/properties/upload',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),

    getPropertiesByAgent: builder.query<
      PaginationResponse<Property> & { agent: Agent },
      { agentId: string; page?: number; limit?: number }
    >({
      query: ({ agentId, page = 1, limit = 12 }) => ({
        url: `/properties/agent/${agentId}`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.properties
          ? [
              ...result.properties.map(({ id }) => ({ type: 'Property' as const, id })),
              'Property',
            ]
          : ['Property'],
    }),

    // Favorites endpoints
    toggleFavorite: builder.mutation<
      { message: string; isFavorite: boolean },
      string
    >({
      query: (propertyId) => ({
        url: '/auth/favorites',
        method: 'POST',
        data: { propertyId },
      }),
      invalidatesTags: ['Favorites', 'Auth'],
    }),

    getFavorites: builder.query<{ favorites: Property[] }, void>({
      query: () => ({
        url: '/auth/favorites',
        method: 'GET',
      }),
      providesTags: ['Favorites'],
    }),

    // Admin endpoints
    getUsers: builder.query<
      PaginationResponse<User>,
      {
        page?: number;
        limit?: number;
        role?: string;
        isActive?: boolean;
        search?: string;
      }
    >({
      query: (params = {}) => ({
        url: '/admin/users',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: 'User' as const, id })),
              'User',
            ]
          : ['User'],
    }),

    toggleUserStatus: builder.mutation<
      { message: string; user: User },
      string
    >({
      query: (userId) => ({
        url: `/admin/users/${userId}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    getAdminProperties: builder.query<
      PaginationResponse<Property>,
      {
        page?: number;
        limit?: number;
        category?: string;
        type?: string;
        isActive?: boolean;
        isFeatured?: boolean;
        search?: string;
      }
    >({
      query: (params = {}) => ({
        url: '/admin/properties',
        method: 'GET',
        params,
      }),
      providesTags: ['Property'],
    }),

    togglePropertyStatus: builder.mutation<
      { message: string; property: Property },
      string
    >({
      query: (propertyId) => ({
        url: `/admin/properties/${propertyId}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, propertyId) => [
        { type: 'Property', id: propertyId },
        'Property',
      ],
    }),

    togglePropertyFeatured: builder.mutation<
      { message: string; property: Property },
      string
    >({
      query: (propertyId) => ({
        url: `/admin/properties/${propertyId}/toggle-featured`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, propertyId) => [
        { type: 'Property', id: propertyId },
        'Property',
      ],
    }),

    getAnalytics: builder.query<
      {
        users: {
          total: number;
          active: number;
          agents: number;
          recentRegistrations: number;
        };
        properties: {
          total: number;
          active: number;
          featured: number;
          recent: number;
          totalViews: number;
          byCategory: Array<{ _id: string; count: number }>;
          byType: Array<{ _id: string; count: number }>;
        };
        topAgents: Array<{ _id: string; count: number; agentName: string }>;
      },
      void
    >({
      query: () => ({
        url: '/admin/analytics',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    deletePropertyAdmin: builder.mutation<{ message: string }, string>({
      query: (propertyId) => ({
        url: `/admin/properties/${propertyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Property', 'Analytics'],
    }),

    getPendingProperties: builder.query<
      { properties: Property[] },
      void
    >({
      query: () => ({
        url: '/admin/properties/pending',
        method: 'GET',
      }),
      providesTags: ['Property'],
    }),

    approveProperty: builder.mutation<
      { message: string; property: Property },
      string
    >({
      query: (propertyId) => ({
        url: `/admin/properties/${propertyId}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Property', 'Analytics', 'Activity'],
    }),

    rejectProperty: builder.mutation<
      { message: string; property: Property },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/properties/${id}/reject`,
        method: 'PUT',
        data: { reason },
      }),
      invalidatesTags: ['Property', 'Analytics', 'Activity'],
    }),

    blockUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/block`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Activity'],
    }),

    unblockUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/unblock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Activity'],
    }),

    deactivateAgent: builder.mutation<{ message: string }, string>({
      query: (agentId) => ({
        url: `/admin/agents/${agentId}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Activity'],
    }),

    activateAgent: builder.mutation<{ message: string }, string>({
      query: (agentId) => ({
        url: `/admin/agents/${agentId}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User', 'Activity'],
    }),

    getActivities: builder.query<
      PaginationResponse<Activity> & { activities: Activity[] },
      { page?: number; limit?: number; action?: string }
    >({
      query: (params = {}) => ({
        url: '/admin/activities',
        method: 'GET',
        params,
      }),
      providesTags: ['Activity'],
    }),

    getRecentActivities: builder.query<
      { activities: Activity[] },
      { limit?: number }
    >({
      query: (params = {}) => ({
        url: '/admin/activities/recent',
        method: 'GET',
        params,
      }),
      providesTags: ['Activity'],
    }),

    getAllFeedbacks: builder.query<
      PaginationResponse<Feedback> & { feedbacks: Feedback[] },
      { page?: number; limit?: number; status?: string }
    >({
      query: (params = {}) => ({
        url: '/admin/feedbacks',
        method: 'GET',
        params,
      }),
      providesTags: ['Feedback'],
    }),

    getFeedbacksByStatus: builder.query<
      { feedbacks: Feedback[] },
      string
    >({
      query: (status) => ({
        url: `/admin/feedbacks/status/${status}`,
        method: 'GET',
      }),
      providesTags: ['Feedback'],
    }),

    respondToFeedback: builder.mutation<
      { message: string; feedback: Feedback },
      { id: string; response: string }
    >({
      query: ({ id, response }) => ({
        url: `/admin/feedbacks/${id}/respond`,
        method: 'PUT',
        data: { response },
      }),
      invalidatesTags: ['Feedback', 'Activity'],
    }),

    createFeedback: builder.mutation<
      { message: string; feedback: Feedback },
      Partial<Feedback>
    >({
      query: (feedbackData) => ({
        url: '/feedbacks',
        method: 'POST',
        data: feedbackData,
      }),
      invalidatesTags: ['Feedback'],
    }),

    getUserFeedbacks: builder.query<
      { feedbacks: Feedback[] },
      void
    >({
      query: () => ({
        url: '/feedbacks/my-feedbacks',
        method: 'GET',
      }),
      providesTags: ['Feedback'],
    }),

    getPropertyFeedbacks: builder.query<
      { feedbacks: Feedback[] },
      string
    >({
      query: (propertyId) => ({
        url: `/feedbacks/property/${propertyId}`,
        method: 'GET',
      }),
      providesTags: ['Feedback'],
    }),

    getDashboardStats: builder.query<
      {
        totalUsers: number;
        totalProperties: number;
        totalRevenue: number;
        activeListings: number;
        pendingApprovals: number;
        monthlyGrowth: number;
        newUsersThisMonth: number;
        newPropertiesThisMonth: number;
      },
      void
    >({
      query: () => ({
        url: '/admin/stats',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Auth hooks
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  
  // Property hooks
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useUploadPropertyImagesMutation,
  useGetPropertiesByAgentQuery,
  
  // Favorites hooks
  useToggleFavoriteMutation,
  useGetFavoritesQuery,
  
  // Admin hooks
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useGetAdminPropertiesQuery,
  useTogglePropertyStatusMutation,
  useTogglePropertyFeaturedMutation,
  useGetAnalyticsQuery,
  useDeleteUserMutation,
  useDeletePropertyAdminMutation,
  useGetPendingPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeactivateAgentMutation,
  useActivateAgentMutation,
  useGetActivitiesQuery,
  useGetRecentActivitiesQuery,
  useGetAllFeedbacksQuery,
  useGetFeedbacksByStatusQuery,
  useRespondToFeedbackMutation,
  useCreateFeedbackMutation,
  useGetUserFeedbacksQuery,
  useGetPropertyFeedbacksQuery,
  useGetDashboardStatsQuery,
} = realEstateApi;