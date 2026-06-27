import type { IUser } from './user';

export interface IAuthResponseData {
  user: IUser;
  token: string;
  refreshToken: string;
}


export interface IAuthResponse {
  success: boolean;
  message: string;
  data: IAuthResponseData;
}
