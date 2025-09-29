import api from '@/lib/axios';

export interface PropertyRequirement {
  _id?: string;
  propertyType?: 'apartment' | 'house' | 'commercial' | 'land';
  budgetRange?: string;
  preferredLocation?: string;
  minSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  additionalRequirements?: string;
  name: string;
  email: string;
  phone: string;
  status?: 'pending' | 'contacted' | 'in_progress' | 'fulfilled' | 'cancelled';
  assignedAgent?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyRequirementFilters {
  status?: string;
  propertyType?: string;
  budgetRange?: string;
  assignedAgent?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PropertyRequirementResponse {
  success: boolean;
  data: PropertyRequirement | PropertyRequirement[];
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PropertyRequirementStats {
  success: boolean;
  data: {
    total: number;
    statusCounts: {
      pending: number;
      contacted: number;
      in_progress: number;
      fulfilled: number;
      cancelled: number;
    };
  };
}

class PropertyRequirementService {
  private baseURL = '/api/property-requirements';

  async createRequirement(data: PropertyRequirement): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllRequirements(filters: PropertyRequirementFilters = {}): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.get(this.baseURL, { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRequirementById(id: string): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRequirement(id: string, data: Partial<PropertyRequirement>): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteRequirement(id: string): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStatus(id: string, status: string, notes?: string): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignAgent(id: string, agentId: string): Promise<PropertyRequirementResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/assign`, { agentId });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStats(): Promise<PropertyRequirementStats> {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('An unexpected error occurred');
  }
}

export default new PropertyRequirementService();