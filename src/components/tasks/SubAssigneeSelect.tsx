import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../api/users';
import type { IUser } from '../../types/user';
import Spinner from '../ui/Spinner';
import { X, UserPlus } from 'lucide-react';

interface SubAssigneeSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  /** The primary assignee ID to exclude from sub-assignee list */
  excludeId?: string;
}

export const SubAssigneeSelect: React.FC<SubAssigneeSelectProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  excludeId,
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const data = await getUsers();
          // Only show active users with role 'user'
          const usersOnly = data.filter((u) => u.role === 'user' && !u.isDisabled);
          setUsers(usersOnly);
          setFetchError(null);
        } catch (err: any) {
          setFetchError(err.response?.data?.message || 'Failed to load users');
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-semibold text-text-muted select-none">Sub-Assigned Users</span>
        <div className="flex items-center gap-2 py-2 px-3 bg-surface rounded-lg border border-border-color h-[38px]">
          <Spinner size="sm" />
          <span className="text-xs text-text-muted">Loading users...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-semibold text-text-muted select-none">Sub-Assigned Users</span>
        <div className="text-xs text-danger py-2 px-3 bg-danger/5 border border-danger/20 rounded-lg">
          {fetchError}
        </div>
      </div>
    );
  }

  // Filter out the primary assignee from sub-assignee options
  const availableUsers = users.filter(
    (u) => u._id !== excludeId && !value.includes(u._id)
  );

  const selectedUsers = users.filter((u) => value.includes(u._id));

  const handleAdd = (userId: string) => {
    onChange([...value, userId]);
    setIsDropdownOpen(false);
  };

  const handleRemove = (userId: string) => {
    onChange(value.filter((id) => id !== userId));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full col-span-full">
      <span className="text-xs font-semibold text-text-muted select-none">
        Sub-Assigned Users (Optional)
      </span>

      {/* Selected users as chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {selectedUsers.map((u) => (
            <span
              key={u._id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/15 rounded-full text-xs font-semibold"
            >
              <span className="truncate max-w-[140px]">{u.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(u._id)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  aria-label={`Remove ${u.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Add button / dropdown */}
      {!disabled && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-muted bg-surface border border-border-color rounded-lg hover:border-primary/40 hover:text-primary transition-all cursor-pointer w-full"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>Add Sub-Assigned User</span>
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-color rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <div className="p-3 text-xs text-text-muted text-center">
                    No more users available
                  </div>
                ) : (
                  availableUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleAdd(u._id)}
                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-text-main hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer border-b border-border-color/30 last:border-b-0"
                    >
                      {u.name} <span className="text-text-muted font-normal">({u.email})</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <span className="text-xs text-danger font-semibold mt-0.5">{error}</span>
      )}
    </div>
  );
};

export default SubAssigneeSelect;
