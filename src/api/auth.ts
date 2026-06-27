import client from './client';
import type { IAuthResponse, IAuthResponseData } from '../types/auth';
import type { IUser } from '../types/user';

export const login = async (credentials: any): Promise<IAuthResponseData> => {
  const response = await client.post<IAuthResponse>('/auth/login', credentials);
  return response.data.data;
};

export const register = async (details: any): Promise<IAuthResponseData> => {
  const response = await client.post<IAuthResponse>('/auth/register', details);
  return response.data.data;
};

export const getMe = async (): Promise<IUser> => {
  interface IMeResponse {
    success: boolean;
    message: string;
    data: {
      user: IUser;
    };
  }
  const response = await client.get<IMeResponse>('/auth/me');
  return response.data.data.user;
};

export const refresh = async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
  interface IRefreshResponse {
    success: boolean;
    message: string;
    data: {
      token: string;
      refreshToken: string;
    };
  }
  const response = await client.post<IRefreshResponse>('/auth/refresh', { refreshToken });
  return response.data.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await client.post('/auth/logout', { refreshToken });
};

export const requestReactivation = async (email: string, reason: string): Promise<void> => {
  await client.post('/auth/request-reactivation', { email, reason });
};

export const changePassword = async (data: any): Promise<void> => {
  await client.put('/auth/change-password', data);
};

export const forgotPassword = async (email: string): Promise<void> => {
  await client.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await client.post('/auth/reset-password', { token, password });
};

export default {
  login,
  register,
  getMe,
  refresh,
  logout,
  requestReactivation,
  changePassword,
  forgotPassword,
  resetPassword,
};

