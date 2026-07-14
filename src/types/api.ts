/**
 * EduSphere — types/api.ts
 * -----------------------------------------------------------------------
 * Generic shapes shared by every service — the standard response envelope
 * the backend wraps all data in, pagination, and the normalized error
 * shape produced by services/api.ts's response interceptor.
 * -----------------------------------------------------------------------
 */

/** The standard envelope every endpoint responds with. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Normalized error shape — every failed request rejects with this,
 *  regardless of whether it was a network failure, a validation error,
 *  or a server error. See services/api.ts's response interceptor. */
export interface ApiError {
  message: string;
  statusCode?: number;
  /** Field-level validation errors, if the backend sends them
   *  (e.g. { email: ["Email is already in use"] }). */
  errors?: Record<string, string[]>;
}

/** Common shape for any paginated list endpoint. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Query params shared by every paginated GET endpoint. Domain-specific
 *  query param types (GroupQueryParams, ResourceQueryParams, etc.) extend
 *  this with their own filters. */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
