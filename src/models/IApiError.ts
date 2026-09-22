export interface IApiErrorInfo {
  status: number;
  message: string;
}

export class ApiError extends Error {
  public readonly status: number;

  constructor(info: IApiErrorInfo) {
    super(info.message);
    this.status = info.status;
    this.name = 'ApiError';
  }
}
