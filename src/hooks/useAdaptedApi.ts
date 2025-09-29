import { useMemo } from 'react';
import {
  useGetPropertiesQuery as useGetPropertiesQueryRaw,
  useGetPendingPropertiesQuery as useGetPendingPropertiesQueryRaw,
  useGetAdminPropertiesQuery as useGetAdminPropertiesQueryRaw,
  useGetUsersQuery as useGetUsersQueryRaw,
  useGetAllFeedbacksQuery as useGetAllFeedbacksQueryRaw,
  useGetActivitiesQuery as useGetActivitiesQueryRaw,
  useGetDashboardStatsQuery as useGetDashboardStatsQueryRaw,
  useGetFavoritesQuery as useGetFavoritesQueryRaw,
  Property,
  User,
  Feedback,
  Activity,
} from '../store/api-new';

interface AdaptedPaginationResponse<T> {
  [key: string]: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total?: number;
  };
}

export const useGetPropertiesQuery = (params: any) => {
  const result = useGetPropertiesQueryRaw(params);

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      properties: result.data.data.properties || [],
      pagination: {
        currentPage: result.data.data.page || 1,
        totalPages: result.data.data.totalPages || 1,
        totalProperties: result.data.data.total || 0,
        hasNext: (result.data.data.page || 1) < (result.data.data.totalPages || 1),
        hasPrev: (result.data.data.page || 1) > 1,
      },
    } : undefined,
  }), [result]);
};

export const useGetPendingPropertiesQuery = () => {
  const result = useGetPendingPropertiesQueryRaw({ page: 1, limit: 100 });

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      properties: result.data.data.properties || [],
    } : undefined,
  }), [result]);
};

export const useGetAdminPropertiesQuery = (params: any) => {
  const result = useGetAdminPropertiesQueryRaw(params);

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      properties: result.data.data.properties || [],
      pagination: {
        currentPage: result.data.data.page || 1,
        totalPages: result.data.data.totalPages || 1,
        hasNext: (result.data.data.page || 1) < (result.data.data.totalPages || 1),
        hasPrev: (result.data.data.page || 1) > 1,
      },
    } : undefined,
  }), [result]);
};

export const useGetUsersQuery = (params: any) => {
  const result = useGetUsersQueryRaw(params);

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      users: result.data.data.users || [],
      pagination: {
        currentPage: result.data.data.page || 1,
        totalPages: result.data.data.totalPages || 1,
        totalUsers: result.data.data.total || 0,
        hasNext: (result.data.data.page || 1) < (result.data.data.totalPages || 1),
        hasPrev: (result.data.data.page || 1) > 1,
      },
    } : undefined,
  }), [result]);
};

export const useGetAllFeedbacksQuery = (params: any) => {
  const result = useGetAllFeedbacksQueryRaw(params);

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      feedbacks: result.data.data.feedbacks || [],
      pagination: {
        currentPage: result.data.data.page || 1,
        totalPages: result.data.data.totalPages || 1,
        hasNext: (result.data.data.page || 1) < (result.data.data.totalPages || 1),
        hasPrev: (result.data.data.page || 1) > 1,
      },
    } : undefined,
  }), [result]);
};

export const useGetActivitiesQuery = (params: any) => {
  const result = useGetActivitiesQueryRaw(params);

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      activities: result.data.data.activities || [],
      pagination: {
        currentPage: result.data.data.page || 1,
        totalPages: result.data.data.totalPages || 1,
        hasNext: (result.data.data.page || 1) < (result.data.data.totalPages || 1),
        hasPrev: (result.data.data.page || 1) > 1,
      },
    } : undefined,
  }), [result]);
};

export const useGetDashboardStatsQuery = () => {
  const result = useGetDashboardStatsQueryRaw();

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      totalUsers: result.data.data.users.total || 0,
      totalProperties: result.data.data.properties.total || 0,
      activeListings: result.data.data.properties.approved || 0,
      pendingApprovals: result.data.data.properties.pending || 0,
      totalRevenue: 0,
      monthlyGrowth: 0,
      newUsersThisMonth: 0,
      newPropertiesThisMonth: 0,
    } : undefined,
  }), [result]);
};

export const useGetFavoritesQuery = () => {
  const result = useGetFavoritesQueryRaw();

  return useMemo(() => ({
    ...result,
    data: result.data ? {
      favorites: result.data.data || [],
    } : undefined,
  }), [result]);
};