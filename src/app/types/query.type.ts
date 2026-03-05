export type PrismaFindManyArgs = {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
};

export type PrismaCountArgs = {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
};

export type PrismaModelDelegate = {
  findMany(args?: any): Promise<any[]>;
  count(args?: any): Promise<number>;
};

export type TQueryParams = {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
  includes?: string;
  [key: string]: unknown;
};

export type TQueryConfig = {
  searchableFields: string[];
  filterableFields: string[];
};

export type PrismaStringFilter = {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "insensitive" | "default";
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  not?: PrismaStringFilter | string;
};

export type PrismaNumberFilter = {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: PrismaNumberFilter | number;
};

export type PrismaWhereConditions = {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
};

export type TQueryResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
