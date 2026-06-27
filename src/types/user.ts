export type Role = 'admin' | 'user';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  address?: string;
  phoneNumber?: string;
  birthday?: string;
  eid?: string;
  isDisabled?: boolean;
  disabledReason?: string;
  disabledBy?: { _id: string; name: string } | null;
  disabledAt?: string;
  reactivationRequested?: boolean;
  reactivationRequestReason?: string;
  reactivationRequestedAt?: string;
  reactivationReason?: string;
  reactivatedBy?: { _id: string; name: string } | null;
  reactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
}
