import { createApi } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import api from "../lib/axios";
import { AxiosError, AxiosRequestConfig } from "axios";

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await api({
        url,
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

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string | null;
  role: "user" | "agent" | "admin";
  isActive: boolean;
  favorites: string[];
  licenseNumber?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: "flat" | "land" | "shop" | "house";
  listingType: "sale" | "rent";
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  location: string;
  address: string;
  images: string[];
  agentId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
      };
  agentName: string;
  agentPhone: string;
  features: string[];
  isActive: boolean;
  isApproved: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  _id: string;
  userId:
    | string
    | { _id: string; name: string; email: string; avatar?: string };
  userName: string;
  userEmail: string;
  propertyId?: string | { _id: string; title: string } | null;
  subject: string;
  message: string;
  rating?: number | null;
  status: "pending" | "reviewed" | "resolved";
  adminResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  adminId:
    | string
    | { _id: string; name: string; email: string; avatar?: string };
  adminName: string;
  action: string;
  targetType: "user" | "property" | "feedback";
  targetId: string;
  targetName?: string;
  description: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    images: string[];
  };
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

interface PaginatedData<T> {
  properties?: T[];
  users?: T[];
  feedbacks?: T[];
  activities?: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const estateApi = createApi({
  reducerPath: "estateApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth", "Property", "User", "Feedback", "Activity", "Stats", "Message"],
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiSuccessResponse<{ user: User; token: string }>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<
      ApiSuccessResponse<{ user: User; token: string }>,
      {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role?: "user" | "agent";
        licenseNumber?: string;
        companyName?: string;
      }
    >({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        data: userData,
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation<ApiSuccessResponse<null>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    getProfile: builder.query<ApiSuccessResponse<User>, void>({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),

    updateProfile: builder.mutation<
      ApiSuccessResponse<User>,
      Partial<Pick<User, "name" | "phone" | "avatar" | "companyName">>
    >({
      query: (profileData) => ({
        url: "/auth/profile",
        method: "PUT",
        data: profileData,
      }),
      invalidatesTags: ["Auth"],
    }),

    changePassword: builder.mutation<
      ApiSuccessResponse<null>,
      { currentPassword: string; newPassword: string }
    >({
      query: (passwords) => ({
        url: "/auth/change-password",
        method: "PUT",
        data: passwords,
      }),
    }),

    toggleFavorite: builder.mutation<ApiSuccessResponse<User>, string>({
      query: (propertyId) => ({
        url: "/auth/favorites",
        method: "POST",
        data: { propertyId },
      }),
      invalidatesTags: ["Auth"],
    }),

    removeFavorite: builder.mutation<ApiSuccessResponse<User>, string>({
      query: (propertyId) => ({
        url: `/auth/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Auth"],
    }),

    getFavorites: builder.query<ApiSuccessResponse<Property[]>, void>({
      query: () => ({
        url: "/auth/favorites",
        method: "GET",
      }),
      providesTags: ["Property"],
    }),

    getProperties: builder.query<
      ApiSuccessResponse<PaginatedData<Property>>,
      {
        page?: number;
        limit?: number;
        category?: string;
        listingType?: string;
        minPrice?: number;
        maxPrice?: number;
        location?: string;
        minArea?: number;
        maxArea?: number;
        bedrooms?: number;
        bathrooms?: number;
        sortBy?: string;
      }
    >({
      query: (params) => ({
        url: "/properties",
        method: "GET",
        params,
      }),
      providesTags: ["Property"],
    }),

    searchProperties: builder.query<
      ApiSuccessResponse<PaginatedData<Property>>,
      { q: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/properties/search",
        method: "GET",
        params,
      }),
      providesTags: ["Property"],
    }),

    getPropertyById: builder.query<ApiSuccessResponse<Property>, string>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Property" as const, id },
      ],
    }),

    getPropertiesByAgent: builder.query<
      ApiSuccessResponse<PaginatedData<Property>>,
      { agentId: string; page?: number; limit?: number }
    >({
      query: ({ agentId, page, limit }) => ({
        url: `/properties/agent/${agentId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Property"],
    }),

    createProperty: builder.mutation<
      ApiSuccessResponse<Property>,
      Partial<Property> | FormData
    >({
      query: (propertyData) => ({
        url: "/properties",
        method: "POST",
        data: propertyData,
        headers: propertyData instanceof FormData ? {
          "Content-Type": "multipart/form-data",
        } : undefined,
      }),
      invalidatesTags: ["Property", "Stats"],
    }),

    updateProperty: builder.mutation<
      ApiSuccessResponse<Property>,
      { id: string; data: Partial<Property> }
    >({
      query: ({ id, data }) => ({
        url: `/properties/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Property"],
    }),

    deleteProperty: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property", "Stats"],
    }),

    togglePropertyStatus: builder.mutation<
      ApiSuccessResponse<Property>,
      string
    >({
      query: (id) => ({
        url: `/properties/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Property"],
    }),

    trackPropertyView: builder.mutation<
      ApiSuccessResponse<{ views: number }>,
      string
    >({
      query: (id) => ({
        url: `/properties/${id}/track-view`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Property" as const, id },
      ],
    }),

    uploadPropertyImages: builder.mutation<
      ApiSuccessResponse<{ images: string[] }>,
      FormData
    >({
      query: (formData) => ({
        url: "/properties/upload",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),

    getDashboardStats: builder.query<
      ApiSuccessResponse<{
        users: { total: number; agents: number; regularUsers: number };
        properties: {
          total: number;
          pending: number;
          approved: number;
          rejected: number;
        };
        feedbacks: { total: number; pending: number };
      }>,
      void
    >({
      query: () => ({
        url: "/admin/stats",
        method: "GET",
      }),
      providesTags: ["Stats"],
    }),

    getAdminProperties: builder.query<
      ApiSuccessResponse<PaginatedData<Property>>,
      {
        page?: number;
        limit?: number;
        isApproved?: string;
        category?: string;
        listingType?: string;
      }
    >({
      query: (params) => ({
        url: "/admin/properties",
        method: "GET",
        params,
      }),
      providesTags: ["Property"],
    }),

    getPendingProperties: builder.query<
      ApiSuccessResponse<PaginatedData<Property>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/admin/properties/pending",
        method: "GET",
        params,
      }),
      providesTags: ["Property"],
    }),

    approveProperty: builder.mutation<ApiSuccessResponse<Property>, string>({
      query: (id) => ({
        url: `/admin/properties/${id}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["Property", "Stats", "Activity"],
    }),

    rejectProperty: builder.mutation<
      ApiSuccessResponse<Property>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/properties/${id}/reject`,
        method: "PUT",
        data: { reason },
      }),
      invalidatesTags: ["Property", "Stats", "Activity"],
    }),

    deletePropertyAdmin: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (id) => ({
        url: `/admin/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property", "Stats", "Activity"],
    }),

    getUsers: builder.query<
      ApiSuccessResponse<PaginatedData<User>>,
      { page?: number; limit?: number; role?: string; isActive?: boolean }
    >({
      query: (params) => ({
        url: "/admin/users",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    getAgents: builder.query<
      ApiSuccessResponse<PaginatedData<User>>,
      { page?: number; limit?: number; isActive?: boolean }
    >({
      query: (params) => ({
        url: "/admin/agents",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    deactivateAgent: builder.mutation<ApiSuccessResponse<User>, string>({
      query: (id) => ({
        url: `/admin/agents/${id}/deactivate`,
        method: "PUT",
      }),
      invalidatesTags: ["User", "Activity"],
    }),

    activateAgent: builder.mutation<ApiSuccessResponse<User>, string>({
      query: (id) => ({
        url: `/admin/agents/${id}/activate`,
        method: "PUT",
      }),
      invalidatesTags: ["User", "Activity"],
    }),

    blockUser: builder.mutation<ApiSuccessResponse<User>, string>({
      query: (id) => ({
        url: `/admin/users/${id}/block`,
        method: "PUT",
      }),
      invalidatesTags: ["User", "Activity"],
    }),

    unblockUser: builder.mutation<ApiSuccessResponse<User>, string>({
      query: (id) => ({
        url: `/admin/users/${id}/unblock`,
        method: "PUT",
      }),
      invalidatesTags: ["User", "Activity"],
    }),

    deleteUser: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Activity"],
    }),

    getAllFeedbacks: builder.query<
      ApiSuccessResponse<PaginatedData<Feedback>>,
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: "/api/feedback/admin/all",
        method: "GET",
        params,
      }),
      providesTags: ["Feedback"],
    }),

    getFeedbacksByStatus: builder.query<
      ApiSuccessResponse<PaginatedData<Feedback>>,
      { status: string; page?: number; limit?: number }
    >({
      query: ({ status, page, limit }) => ({
        url: `/admin/feedbacks/status/${status}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Feedback"],
    }),

    respondToFeedback: builder.mutation<
      ApiSuccessResponse<Feedback>,
      { id: string; adminResponse: string; status?: "reviewed" | "resolved" }
    >({
      query: ({ id, adminResponse, status }) => ({
        url: `/api/feedback/admin/${id}/respond`,
        method: "PUT",
        data: { adminResponse, status },
      }),
      invalidatesTags: ["Feedback", "Activity"],
    }),

    getActivities: builder.query<
      ApiSuccessResponse<PaginatedData<Activity>>,
      { page?: number; limit?: number; action?: string; targetType?: string }
    >({
      query: (params) => ({
        url: "/admin/activities",
        method: "GET",
        params,
      }),
      providesTags: ["Activity"],
    }),

    getRecentActivities: builder.query<
      ApiSuccessResponse<Activity[]>,
      { limit?: number }
    >({
      query: (params) => ({
        url: "/admin/activities/recent",
        method: "GET",
        params,
      }),
      providesTags: ["Activity"],
    }),

    createFeedback: builder.mutation<
      ApiSuccessResponse<Feedback>,
      { propertyId?: string; subject: string; message: string; rating?: number }
    >({
      query: (feedbackData) => ({
        url: "/feedbacks",
        method: "POST",
        data: feedbackData,
      }),
      invalidatesTags: ["Feedback"],
    }),

    getMyFeedbacks: builder.query<
      ApiSuccessResponse<PaginatedData<Feedback>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/feedbacks/my-feedbacks",
        method: "GET",
        params,
      }),
      providesTags: ["Feedback"],
    }),

    getFeedbackById: builder.query<ApiSuccessResponse<Feedback>, string>({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Feedback" as const, id },
      ],
    }),

    getPropertyFeedbacks: builder.query<
      ApiSuccessResponse<PaginatedData<Feedback>>,
      { propertyId: string; page?: number; limit?: number }
    >({
      query: ({ propertyId, page, limit }) => ({
        url: `/feedbacks/property/${propertyId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Feedback"],
    }),

    getPropertyAverageRating: builder.query<
      ApiSuccessResponse<{ avgRating: number; count: number }>,
      string
    >({
      query: (propertyId) => ({
        url: `/feedbacks/property/${propertyId}/rating`,
        method: "GET",
      }),
    }),

    updateFeedback: builder.mutation<
      ApiSuccessResponse<Feedback>,
      {
        id: string;
        data: { subject?: string; message?: string; rating?: number };
      }
    >({
      query: ({ id, data }) => ({
        url: `/feedbacks/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Feedback"],
    }),

    deleteFeedback: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (id) => ({
        url: `/feedbacks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Feedback"],
    }),

    getMyTours: builder.query<ApiSuccessResponse<any[]>, void>({
      query: () => ({
        url: "/tours/my-tours",
        method: "GET",
      }),
      providesTags: ["Property"],
    }),

    scheduleTour: builder.mutation<
      ApiSuccessResponse<any>,
      {
        propertyId: string;
        date: string;
        time: string;
        notes?: string;
        buyerPhone?: string;
        buyerEmail?: string;
      }
    >({
      query: (tourData) => ({
        url: "/tours/schedule",
        method: "POST",
        data: tourData,
      }),
      invalidatesTags: ["Property"],
    }),

    updateTourStatus: builder.mutation<
      ApiSuccessResponse<any>,
      { tourId: string; status: string }
    >({
      query: ({ tourId, status }) => ({
        url: `/tours/${tourId}/status`,
        method: "PUT",
        data: { status },
      }),
      invalidatesTags: ["Property"],
    }),

    getAgentTours: builder.query<ApiSuccessResponse<any[]>, void>({
      query: () => ({
        url: "/tours/agent-tours",
        method: "GET",
      }),
      providesTags: ["Property"],
    }),

    // Message endpoints
    getMyMessages: builder.query<ApiSuccessResponse<Message[]>, void>({
      query: () => ({
        url: "/messages/my-messages",
        method: "GET",
      }),
      providesTags: ["Message"],
    }),

    getMessageStats: builder.query<
      ApiSuccessResponse<{ total: number; unread: number; archived: number }>,
      void
    >({
      query: () => ({
        url: "/messages/stats",
        method: "GET",
      }),
      providesTags: ["Message"],
    }),

    getMessage: builder.query<ApiSuccessResponse<Message>, string>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Message" as const, id },
      ],
    }),

    markMessageAsRead: builder.mutation<ApiSuccessResponse<Message>, string>({
      query: (id) => ({
        url: `/messages/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Message"],
    }),

    toggleMessageArchive: builder.mutation<ApiSuccessResponse<Message>, string>({
      query: (id) => ({
        url: `/messages/${id}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: ["Message"],
    }),

    deleteMessage: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Message"],
    }),

    sendMessage: builder.mutation<
      ApiSuccessResponse<Message>,
      {
        propertyId: string;
        message: string;
        senderName?: string;
        senderEmail?: string;
        senderPhone?: string;
      }
    >({
      query: (messageData) => ({
        url: "/messages/send",
        method: "POST",
        data: messageData,
      }),
      invalidatesTags: ["Message"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useToggleFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetFavoritesQuery,
  useGetPropertiesQuery,
  useSearchPropertiesQuery,
  useGetPropertyByIdQuery,
  useGetPropertiesByAgentQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useTogglePropertyStatusMutation,
  useTrackPropertyViewMutation,
  useUploadPropertyImagesMutation,
  useGetDashboardStatsQuery,
  useGetAdminPropertiesQuery,
  useGetPendingPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useDeletePropertyAdminMutation,
  useGetUsersQuery,
  useGetAgentsQuery,
  useDeactivateAgentMutation,
  useActivateAgentMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,
  useGetAllFeedbacksQuery,
  useGetFeedbacksByStatusQuery,
  useRespondToFeedbackMutation,
  useGetActivitiesQuery,
  useGetRecentActivitiesQuery,
  useCreateFeedbackMutation,
  useGetMyFeedbacksQuery,
  useGetFeedbackByIdQuery,
  useGetPropertyFeedbacksQuery,
  useGetPropertyAverageRatingQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetMyToursQuery,
  useScheduleTourMutation,
  useUpdateTourStatusMutation,
  useGetAgentToursQuery,
  useGetMyMessagesQuery,
  useGetMessageStatsQuery,
  useGetMessageQuery,
  useMarkMessageAsReadMutation,
  useToggleMessageArchiveMutation,
  useDeleteMessageMutation,
  useSendMessageMutation,
} = estateApi;
