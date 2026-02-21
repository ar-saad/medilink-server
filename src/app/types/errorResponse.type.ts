export type TErrorSources = {
  path: string;
  message: string;
};

export type TErrorResponse = {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSources?: TErrorSources[];
  error?: any;
  stack?: string;
};
