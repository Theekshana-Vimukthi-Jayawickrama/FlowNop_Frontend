import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../api/users';
import type { IUser } from '../../types/user';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';

interface AssigneeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const AssigneeSelect: React.FC<AssigneeSelectProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const data = await getUsers();
          // Filter to only show users with role 'user' — tasks cannot be assigned to admins
          const usersOnly = data.filter((u) => u.role === 'user');
          setUsers(usersOnly);
          setFetchError(null);
        } catch (err: any) {
          setFetchError(err.response?.data?.message || 'Failed to load users');
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    } else {
      // Normal user: default to themselves
      if (user && !value) {
        onChange(user._id);
      }
    }
  }, [isAdmin, user, value, onChange]);

  if (!isAdmin) {
    // Hide the control for non-admins, but render a hidden input to keep the form state valid
    return <input type="hidden" value={value} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-semibold text-text-muted select-none">Assigned To</span>
        <div className="flex items-center gap-2 py-2 px-3 bg-surface rounded-lg border border-border-color h-[38px]">
          <Spinner size="sm" />
          <span className="text-xs text-text-muted">Loading assignees...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-semibold text-text-muted select-none">Assigned To</span>
        <div className="text-xs text-danger py-2 px-3 bg-danger/5 border border-danger/20 rounded-lg">
          {fetchError}
        </div>
      </div>
    );
  }

  const options = [
    { value: '', label: 'Select Assignee (Optional)' },
    ...users.map((u) => ({
      value: u._id,
      label: `${u.name} (${u.email})`,
    })),
  ];

  return (
    <Select
      label="Assigned To"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      error={error}
      disabled={disabled}
    />
  );
};

export default AssigneeSelect;
