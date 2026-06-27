import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import useUsers from '../features/users/useUsers';
import { createAdmin, updateAdmin, deleteAdmin, disableUser, reactivateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import { UserPlus, Edit2, Trash2, Shield, Users as UsersIcon, AlertCircle } from 'lucide-react';
import type { IUser } from '../types/user';

// Zod validation schemas
// Phone validation rules and helpers
const phoneValidationRefinement = (data: { countryCode: string; phoneNumber: string }, ctx: z.RefinementCtx) => {
  const { countryCode, phoneNumber } = data;
  if (!phoneNumber) return;
  
  if (countryCode === '+94') {
    if (!/^\d{9}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sri Lankan numbers must be exactly 9 digits (e.g. 771234567)',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+91') {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indian mobile numbers must be 10 digits starting with 6-9',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+1') {
    if (!/^\d{10}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'US phone numbers must be exactly 10 digits',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+44') {
    if (!/^\d{10}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'UK phone numbers must be exactly 10 digits',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+61') {
    if (!/^\d{9}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Australian numbers must be exactly 9 digits',
        path: ['phoneNumber'],
      });
    }
  }
};

const parsePhoneNumber = (fullNumber: string) => {
  const codes = ['+94', '+91', '+1', '+44', '+61'];
  for (const code of codes) {
    if (fullNumber.startsWith(code)) {
      return {
        countryCode: code,
        phoneNumber: fullNumber.slice(code.length),
      };
    }
  }
  return {
    countryCode: '+94',
    phoneNumber: fullNumber,
  };
};

const createAdminSchema = z.object({
  username: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  eid: z.string().min(1, 'Employee ID is required'),
  address: z.string().min(1, 'Address is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
}).superRefine(phoneValidationRefinement);

const editAdminSchema = z.object({
  password: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true;
        return (
          val.length >= 8 &&
          /[a-z]/.test(val) &&
          /[A-Z]/.test(val) &&
          /\d/.test(val) &&
          /[@$!%*?&]/.test(val)
        );
      },
      {
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      }
    ),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  eid: z.string().min(1, 'Employee ID is required'),
  address: z.string().min(1, 'Address is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
}).superRefine(phoneValidationRefinement);

type CreateAdminInputs = z.infer<typeof createAdminSchema>;
type EditAdminInputs = z.infer<typeof editAdminSchema>;

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const isSuperAdmin = currentUser?.email?.toLowerCase() === 'superadminflownop@gmail.com';

  const { data: accounts = [], isLoading, isError, refetch } = useUsers();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<IUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<IUser | null>(null);
  const [disablingUser, setDisablingUser] = useState<IUser | null>(null);
  const [recoveringUser, setRecoveringUser] = useState<IUser | null>(null);
  const [actionReason, setActionReason] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablingUser || !actionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await disableUser(disablingUser._id, actionReason);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDisablingUser(null);
      setActionReason('');
      toastSuccess('Account disabled successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to disable user account';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveringUser || !actionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await reactivateUser(recoveringUser._id, actionReason);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRecoveringUser(null);
      setActionReason('');
      toastSuccess('Account recovered successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to recover user account';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form setups
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm<CreateAdminInputs>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      countryCode: '+94',
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<EditAdminInputs>({
    resolver: zodResolver(editAdminSchema),
  });

  // Action handlers
  const onCreateSubmit = async (data: CreateAdminInputs) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const { countryCode, phoneNumber, ...rest } = data;
      await createAdmin({
        ...rest,
        phoneNumber: `${countryCode}${phoneNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateModalOpen(false);
      resetCreate();
      toastSuccess('Admin account created successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create admin account';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (data: EditAdminInputs) => {
    if (!editingAdmin) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const { countryCode, phoneNumber, ...rest } = data;
      const payload: any = {
        ...rest,
        phoneNumber: `${countryCode}${phoneNumber}`,
      };
      if (!payload.password) delete payload.password;

      await updateAdmin(editingAdmin._id, payload);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingAdmin(null);
      resetEdit();
      toastSuccess('Admin account updated successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update admin account';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!deletingAdmin) return;
    setIsSubmitting(true);
    try {
      await deleteAdmin(deletingAdmin._id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingAdmin(null);
      toastSuccess('Admin account deleted successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete admin account';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (admin: IUser) => {
    setEditingAdmin(admin);
    const parsed = parsePhoneNumber(admin.phoneNumber || '');
    resetEdit({
      name: admin.name,
      eid: admin.eid || '',
      address: admin.address || '',
      countryCode: parsed.countryCode,
      phoneNumber: parsed.phoneNumber,
      password: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/25 text-danger rounded-2xl flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto shadow-sm">
        <AlertCircle className="w-10 h-10 shrink-0" />
        <div>
          <h3 className="font-bold text-base">Failed to load directory</h3>
          <p className="text-xs mt-1 font-semibold">Please check your network connection.</p>
        </div>
        <Button variant="danger" onClick={() => refetch()} className="text-xs py-1.5 px-4 font-bold">
          Retry
        </Button>
      </div>
    );
  }

  const adminsList = accounts.filter((a) => a.role === 'admin');
  const usersList = accounts.filter((a) => a.role === 'user');

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-main leading-tight flex items-center gap-2 select-none">
            <UsersIcon className="w-6 h-6 text-primary" />
            Users & Collaborators Directory
          </h1>
          <p className="text-xs text-text-muted mt-1 font-semibold">
            {isSuperAdmin 
              ? 'Manage administrator credentials and review system collaborators.' 
              : 'Unified directory of project administrators and standard collaborators.'}
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            className="flex items-center gap-1.5 self-end sm:self-auto select-none"
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            id="create-admin-btn"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Create Admin</span>
          </Button>
        )}
      </div>

      {/* Admin Accounts Table */}
      <Card className="shadow-md border-border-color p-0 overflow-hidden">
        <div className="p-4 border-b border-border-color bg-background/35 select-none flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">Administrators</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {adminsList.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-text-muted italic select-none">
              No administrator accounts registered.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-background/50 select-none text-[10px] uppercase font-bold text-text-muted">
                  <th className="p-4">Name</th>
                  <th className="p-4">Username (Email)</th>
                  <th className="p-4">Employee ID (EID)</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Activation Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/60 text-sm">
                {adminsList.map((admin) => (
                  <tr key={admin._id} className="hover:bg-background/20 transition-colors duration-150">
                    <td className="p-4 font-bold text-text-main">{admin.name}</td>
                    <td className="p-4 text-text-muted">{admin.email}</td>
                    <td className="p-4 text-text-main font-semibold">
                      <span className="bg-primary/10 text-primary border border-primary/10 px-2 py-0.5 rounded-lg text-xs">
                        {admin.eid || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted font-medium">{admin.phoneNumber || 'N/A'}</td>
                    <td className="p-4 text-text-muted max-w-[200px] truncate" title={admin.address}>
                      {admin.address || 'N/A'}
                    </td>
                    <td className="p-4">
                      {admin.isDisabled ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/15 select-none">
                            Disabled
                          </span>
                          {admin.disabledReason && (
                            <span className="text-[10px] text-text-muted font-medium truncate max-w-[150px]" title={`Reason: ${admin.disabledReason}. Disabled by ${admin.disabledBy?.name || 'Admin'}`}>
                              Reason: {admin.disabledReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 select-none">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2 items-center">
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(admin)}
                              className="p-1.5 rounded-lg border border-border-color bg-surface hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                              title="Edit Admin"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingAdmin(admin)}
                              disabled={admin.email.toLowerCase() === 'superadminflownop@gmail.com'}
                              className={`p-1.5 rounded-lg border border-border-color bg-surface hover:text-danger hover:border-danger/30 transition-all cursor-pointer ${
                                admin.email.toLowerCase() === 'superadminflownop@gmail.com' ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title="Delete Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {isSuperAdmin && admin._id !== currentUser?._id && admin.email.toLowerCase() !== 'superadminflownop@gmail.com' && (
                          admin.isDisabled ? (
                            <button
                              onClick={() => {
                                setRecoveringUser(admin);
                                setActionReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                              title="Recover Admin Account"
                            >
                              Recover
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setDisablingUser(admin);
                                setActionReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-danger/30 bg-danger/5 text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all cursor-pointer"
                              title="Disable Admin Account"
                            >
                              Disable
                            </button>
                          )
                        )}
                        {(!isSuperAdmin || admin._id === currentUser?._id || admin.email.toLowerCase() === 'superadminflownop@gmail.com') && (
                          <span className="text-xs text-text-muted/40 select-none px-1">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Standard Users Table */}
      <Card className="shadow-md border-border-color p-0 overflow-hidden">
        <div className="p-4 border-b border-border-color bg-background/35 select-none flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-text-muted shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Standard Users</h3>
        </div>
        <div className="w-full overflow-x-auto">
          {usersList.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-text-muted italic select-none">
              No collaborator accounts registered.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-color bg-background/50 select-none text-[10px] uppercase font-bold text-text-muted">
                  <th className="p-4">Name</th>
                  <th className="p-4">Username (Email)</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Birthday</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Activation Status</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Reactivation Request</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/60 text-sm">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-background/20 transition-colors duration-150">
                    <td className="p-4 font-bold text-text-main">{u.name}</td>
                    <td className="p-4 text-text-muted">{u.email}</td>
                    <td className="p-4 text-text-muted font-medium">{u.phoneNumber || 'N/A'}</td>
                    <td className="p-4 text-text-muted">
                      {u.birthday ? new Date(u.birthday).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-text-muted max-w-[200px] truncate" title={u.address}>
                      {u.address || 'N/A'}
                    </td>
                    <td className="p-4">
                      {u.isDisabled ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/15 select-none">
                            Disabled
                          </span>
                          {u.reactivationRequested && (
                            <span className="inline-flex self-start items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/15 animate-pulse mt-1 select-none">
                              Reactivation Requested
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 select-none">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-text-muted max-w-[150px] truncate font-medium" title={u.isDisabled && u.disabledReason ? `Reason: ${u.disabledReason}${u.disabledBy?.name ? ` (Disabled by ${u.disabledBy.name})` : ''}` : undefined}>
                      {u.isDisabled ? (u.disabledReason || '—') : '—'}
                    </td>
                    <td className="p-4 text-text-muted max-w-[150px] truncate font-medium" title={u.reactivationRequested && u.reactivationRequestReason ? `Appeal: "${u.reactivationRequestReason}"` : undefined}>
                      {u.reactivationRequested ? (u.reactivationRequestReason || '—') : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        {u.isDisabled ? (
                          <button
                            onClick={() => {
                              setRecoveringUser(u);
                              setActionReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                            title="Recover User Account"
                          >
                            Recover
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setDisablingUser(u);
                              setActionReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-danger/30 bg-danger/5 text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all cursor-pointer"
                            title="Disable User Account"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Create Admin Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Admin Account"
      >
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="flex flex-col gap-4 text-left">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Username (Email Address)"
            type="email"
            placeholder="admin@taskflow.com"
            error={errorsCreate.username?.message}
            disabled={isSubmitting}
            {...registerCreate('username')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errorsCreate.password?.message}
            disabled={isSubmitting}
            {...registerCreate('password')}
          />

          <Input
            label="Full Name"
            type="text"
            placeholder="Admin Full Name"
            error={errorsCreate.name?.message}
            disabled={isSubmitting}
            {...registerCreate('name')}
          />

          <Input
            label="Employee ID (EID)"
            type="text"
            placeholder="E.g. EID-12345"
            error={errorsCreate.eid?.message}
            disabled={isSubmitting}
            {...registerCreate('eid')}
          />

          <Input
            label="Address"
            type="text"
            placeholder="Admin Address"
            error={errorsCreate.address?.message}
            disabled={isSubmitting}
            {...registerCreate('address')}
          />

          <div className="flex gap-2 items-start w-full text-left">
            <div className="w-1/3">
              <Select
                label="Code"
                options={[
                  { value: '+94', label: 'LK (+94)' },
                  { value: '+91', label: 'IN (+91)' },
                  { value: '+1', label: 'US (+1)' },
                  { value: '+44', label: 'UK (+44)' },
                  { value: '+61', label: 'AU (+61)' },
                ]}
                disabled={isSubmitting}
                error={errorsCreate.countryCode?.message}
                {...registerCreate('countryCode')}
              />
            </div>
            <div className="w-2/3">
              <Input
                label="Phone Number"
                type="text"
                placeholder="771234567"
                error={errorsCreate.phoneNumber?.message}
                disabled={isSubmitting}
                {...registerCreate('phoneNumber')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={!!editingAdmin}
        onClose={() => setEditingAdmin(null)}
        title="Edit Admin Account"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="flex flex-col gap-4 text-left">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="text-xs text-text-muted p-3 bg-background/50 border border-border-color/80 rounded-xl">
            Editing credentials for <span className="font-bold text-text-main">{editingAdmin?.email}</span>
          </div>

          <Input
            label="Full Name"
            type="text"
            placeholder="Admin Full Name"
            error={errorsEdit.name?.message}
            disabled={isSubmitting}
            {...registerEdit('name')}
          />

          <Input
            label="Employee ID (EID)"
            type="text"
            placeholder="EID"
            error={errorsEdit.eid?.message}
            disabled={isSubmitting}
            {...registerEdit('eid')}
          />

          <Input
            label="Address"
            type="text"
            placeholder="Admin Address"
            error={errorsEdit.address?.message}
            disabled={isSubmitting}
            {...registerEdit('address')}
          />

          <div className="flex gap-2 items-start w-full text-left">
            <div className="w-1/3">
              <Select
                label="Code"
                options={[
                  { value: '+94', label: 'LK (+94)' },
                  { value: '+91', label: 'IN (+91)' },
                  { value: '+1', label: 'US (+1)' },
                  { value: '+44', label: 'UK (+44)' },
                  { value: '+61', label: 'AU (+61)' },
                ]}
                disabled={isSubmitting}
                error={errorsEdit.countryCode?.message}
                {...registerEdit('countryCode')}
              />
            </div>
            <div className="w-2/3">
              <Input
                label="Phone Number"
                type="text"
                placeholder="771234567"
                error={errorsEdit.phoneNumber?.message}
                disabled={isSubmitting}
                {...registerEdit('phoneNumber')}
              />
            </div>
          </div>

          <Input
            label="New Password (Leave blank to keep unchanged)"
            type="password"
            placeholder="••••••••"
            error={errorsEdit.password?.message}
            disabled={isSubmitting}
            {...registerEdit('password')}
          />

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingAdmin(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingAdmin}
        onClose={() => setDeletingAdmin(null)}
        onConfirm={onDeleteConfirm}
        title="Delete Admin Account"
        message={`Are you sure you want to permanently delete administrator account "${deletingAdmin?.name}"? All dashboard permissions for this account will be revoked.`}
        confirmText="Delete"
        cancelText="Cancel"
        isConfirming={isSubmitting}
      />

      {/* Disable Account Modal */}
      <Modal
        isOpen={!!disablingUser}
        onClose={() => setDisablingUser(null)}
        title="Disable User Account"
      >
        <form onSubmit={onDisableSubmit} className="flex flex-col gap-4 text-left">
          <div className="text-xs text-text-muted p-3 bg-danger/5 border border-danger/15 rounded-xl">
            You are disabling the account for <span className="font-bold text-text-main">{disablingUser?.name} ({disablingUser?.email})</span>. They will be immediately logged out and blocked from logging in.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted select-none">
              Reason for Disablement
            </label>
            <textarea
              className="w-full px-3.5 py-2 bg-surface text-text-main text-sm rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all disabled:opacity-50 min-h-[100px] resize-none"
              placeholder="Enter the reason why this account is being disabled (required)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDisablingUser(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting} disabled={!actionReason.trim()}>
              Disable Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recover Account Modal */}
      <Modal
        isOpen={!!recoveringUser}
        onClose={() => setRecoveringUser(null)}
        title="Recover User Account"
      >
        <form onSubmit={onRecoverSubmit} className="flex flex-col gap-4 text-left">
          <div className="text-xs text-text-muted p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            You are reactivating/recovering the account for <span className="font-bold text-text-main">{recoveringUser?.name} ({recoveringUser?.email})</span>.
          </div>

          {recoveringUser?.reactivationRequested && (
            <div className="mb-2 p-3 bg-amber-500/5 border border-amber-500/15 text-amber-600 text-xs font-semibold rounded-xl">
              <strong>User's reactivation appeal:</strong>
              <p className="mt-1 text-text-main italic">"{recoveringUser.reactivationRequestReason}"</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted select-none">
              Reason for Reactivation
            </label>
            <textarea
              className="w-full px-3.5 py-2 bg-surface text-text-main text-sm rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all disabled:opacity-50 min-h-[100px] resize-none"
              placeholder="Enter the reason why this account is being recovered (required)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRecoveringUser(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={!actionReason.trim()}>
              Recover Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
