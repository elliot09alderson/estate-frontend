import api from './axios';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    total: number;
    page: number;
    totalPages: number;
  };
}

class ApiClient {
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    try {
      const response = await api.request<T>({
        method,
        url,
        data,
        ...config,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  get<T>(url: string, params?: any) {
    return this.request<T>('GET', url, undefined, { params });
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.request<T>('POST', url, data, config);
  }

  put<T>(url: string, data?: any) {
    return this.request<T>('PUT', url, data);
  }

  patch<T>(url: string, data?: any) {
    return this.request<T>('PATCH', url, data);
  }

  delete<T>(url: string) {
    return this.request<T>('DELETE', url);
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, PaginatedResponse };