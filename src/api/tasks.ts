import client from './client';
import type { 
  IGetTasksParams, 
  IPaginatedTaskResponse, 
  ISingleTaskResponse,
  ICreateTaskInput,
  IUpdateTaskInput
} from '../types/task';

export const getTasks = async (params?: IGetTasksParams): Promise<IPaginatedTaskResponse> => {
  const response = await client.get<IPaginatedTaskResponse>('/tasks', { params });
  return response.data;
};

export const getAllTasks = async (params?: IGetTasksParams): Promise<IPaginatedTaskResponse> => {
  const response = await client.get<IPaginatedTaskResponse>('/tasks/all', { params });
  return response.data;
};

export const getTask = async (id: string): Promise<ISingleTaskResponse> => {
  const response = await client.get<ISingleTaskResponse>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: ICreateTaskInput): Promise<ISingleTaskResponse> => {
  const response = await client.post<ISingleTaskResponse>('/tasks', data);
  return response.data;
};

export const updateTask = async (id: string, data: IUpdateTaskInput): Promise<ISingleTaskResponse> => {
  const response = await client.patch<ISingleTaskResponse>(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await client.delete(`/tasks/${id}`);
};

export const approveTask = async (id: string): Promise<ISingleTaskResponse> => {
  const response = await client.patch<ISingleTaskResponse>(`/tasks/${id}/approve`);
  return response.data;
};

export default {
  getTasks,
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  approveTask,
};
