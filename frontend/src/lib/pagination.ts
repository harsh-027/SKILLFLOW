export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const defaultPaginationMeta: PaginationMeta = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function readPaginatedItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const response = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(response.items)) return response.items as T[];
    if (Array.isArray(response.data)) return response.data as T[];
  }

  return [];
}

export function readPaginationMeta(payload: unknown): PaginationMeta {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return defaultPaginationMeta;
  }

  const response = payload as Partial<PaginationMeta>;

  return {
    currentPage: Number(response.currentPage) || 1,
    totalPages: Number(response.totalPages) || 0,
    totalItems: Number(response.totalItems) || 0,
    hasNextPage: Boolean(response.hasNextPage),
    hasPreviousPage: Boolean(response.hasPreviousPage),
  };
}
