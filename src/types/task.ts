import type { IUser } from './user';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'open' | 'in_progress' | 'testing' | 'done';

export interface IStatusHistoryEntry {
  status: TaskStatus;
  changedBy: Pick<IUser, '_id' | 'name' | 'email'>;
  changedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdBy: Pick<IUser, '_id' | 'name' | 'email' | 'role'>;
  assignedTo?: Pick<IUser, '_id' | 'name' | 'email' | 'role'>;
  subAssignedTo: Pick<IUser, '_id' | 'name' | 'email' | 'role'>[];
  approved: boolean;
  approvedByAdmin?: string;
  statusHistory: IStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface IGetTasksParams {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
  approved?: string;
}

export interface IPaginatedTaskResponse {
  success: boolean;
  message: string;
  data: ITask[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ISingleTaskResponse {
  success: boolean;
  message: string;
  data: ITask;
}

export interface ICreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assignedTo?: string;
  subAssignedTo?: string[];
}

export interface IUpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assignedTo?: string;
  subAssignedTo?: string[];
}
