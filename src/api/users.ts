import client from './client';
import type { IUser } from '../types/user';

interface IUsersResponse {
  success: boolean;
  message: string;
  data: IUser[];
}

export const getUsers = async (): Promise<IUser[]> => {
  const response = await client.get<IUsersResponse>('/users');
  return response.data.data;
};

export const createAdmin = async (data: any): Promise<IUser> => {
  interface IAdminResponse {
    success: boolean;
    data: IUser;
  }
  const response = await client.post<IAdminResponse>('/users/admins', data);
  return response.data.data;
};

export const updateAdmin = async (id: string, data: any): Promise<IUser> => {
  interface IAdminResponse {
    success: boolean;
    data: IUser;
  }
  const response = await client.patch<IAdminResponse>(`/users/admins/${id}`, data);
  return response.data.data;
};

export const deleteAdmin = async (id: string): Promise<void> => {
  await client.delete(`/users/admins/${id}`);
};

export const disableUser = async (id: string, reason: string): Promise<IUser> => {
  interface IResponse {
    success: boolean;
    data: IUser;
  }
  const response = await client.post<IResponse>(`/users/${id}/disable`, { reason });
  return response.data.data;
};

export const reactivateUser = async (id: string, reason: string): Promise<IUser> => {
  interface IResponse {
    success: boolean;
    data: IUser;
  }
  const response = await client.post<IResponse>(`/users/${id}/reactivate`, { reason });
  return response.data.data;
};

export default {
  getUsers,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  disableUser,
  reactivateUser,
};
