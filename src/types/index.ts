// Shared TypeScript interfaces and types for Destination Cafe CRM

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
