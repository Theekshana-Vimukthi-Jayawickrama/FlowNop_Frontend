import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Users, LayoutDashboard, Globe, User, Key, AlertCircle, CheckCircle2, ListTodo } from 'lucide-react';
import Logo from '../ui/Logo';
import { ThemeToggle } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import RoleRoute from '../../routes/RoleRoute';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import authApi from '../../api/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty('Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .refine(
      (val) =>
        /[a-z]/.test(val) &&
        /[A-Z]/.test(val) &&
        /[0-9]/.test(val) &&
        /[^a-zA-Z0-9]/.test(val),
      {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }
    ),
  confirmNewPassword: z.string().nonempty('Confirm new password is required'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCloseChangePassword = () => {
    setIsChangePasswordOpen(false);
    setPasswordError(null);
    setPasswordSuccess(false);
    resetPassword();
  };

  const onChangePasswordSubmit = async (data: ChangePasswordInput) => {
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      setPasswordSuccess(true);
      resetPassword();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your credentials.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Tasks', path: '/tasks', icon: <ListTodo className="w-5 h-5" /> },
    { label: 'All Tasks', path: '/all-tasks', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Topbar */}
      <header className="h-16 bg-surface border-b border-border-color sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-muted text-text-muted hover:text-text-main md:hidden cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="text-xl font-bold tracking-tight text-text-main flex items-center gap-2 select-none">
            <Logo className="w-6 h-6" />
            FlowNop
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* User Menu Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 border-l border-border-color pl-4 hover:opacity-85 focus:outline-none transition-all cursor-pointer"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm select-none">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-text-main">{user?.name || 'User'}</span>
                <span className="text-[10px] text-text-muted capitalize">{user?.role || 'user'}</span>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-surface border border-border-color rounded-xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all duration-200">
                {/* User Info Header */}
                <div className="p-4 border-b border-border-color flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl select-none mb-3">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h4 className="text-sm font-bold text-text-main">{user?.name || 'User'}</h4>
                  <p className="text-xs text-text-muted mb-2">{user?.email}</p>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {user?.role || 'user'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="p-2 flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsViewProfileOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-main hover:bg-muted rounded-lg w-full text-left transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-text-muted" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-main hover:bg-muted rounded-lg w-full text-left transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-text-muted" />
                    Change Password
                  </button>
                  <div className="border-t border-border-color/60 my-1"></div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-lg w-full text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Backing Backdrop (Mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-64 bg-surface border-r border-border-color p-4 flex flex-col justify-between transform transition-transform duration-200 md:sticky md:top-16 md:h-[calc(100vh-64px)] ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all select-none ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/10'
                      : 'text-text-muted hover:bg-muted hover:text-text-main'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            <RoleRoute allowedRoles={['admin']} fallback={null}>
              <div className="mt-4 pt-4 border-t border-border-color flex flex-col gap-1.5">
                <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 select-none">
                  Administration
                </p>
                <NavLink
                  to="/users"
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all select-none ${
                      isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/10'
                        : 'text-text-muted hover:bg-muted hover:text-text-main'
                    }`
                  }
                >
                  <Users className="w-5 h-5" />
                  Users
                </NavLink>
              </div>
            </RoleRoute>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10 transition-colors w-full cursor-pointer mt-auto border border-transparent hover:border-danger/20"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden">
          {children}
        </main>
      </div>

      {/* View Profile Modal */}
      <Modal
        isOpen={isViewProfileOpen}
        onClose={() => setIsViewProfileOpen(false)}
        title="User Profile Details"
      >
        <div className="flex flex-col gap-6 text-left">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-background/50 border border-border-color/85 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl select-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col">
              <h4 className="text-base font-bold text-text-main">{user?.name}</h4>
              <p className="text-xs text-text-muted">{user?.email}</p>
              <div className="flex gap-2 items-center mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {user?.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Employee ID (EID)</span>
              <span className="text-sm font-semibold text-text-main bg-background/30 p-2 rounded-lg border border-border-color/40">
                {user?.eid || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Phone Number</span>
              <span className="text-sm font-semibold text-text-main bg-background/30 p-2 rounded-lg border border-border-color/40">
                {user?.phoneNumber || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Address</span>
              <span className="text-sm font-semibold text-text-main bg-background/30 p-2 rounded-lg border border-border-color/40">
                {user?.address || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Birthday</span>
              <span className="text-sm font-semibold text-text-main bg-background/30 p-2 rounded-lg border border-border-color/40">
                {user?.birthday ? new Date(user.birthday).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Date Joined</span>
              <span className="text-sm font-semibold text-text-main bg-background/30 p-2 rounded-lg border border-border-color/40">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-color/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewProfileOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={handleCloseChangePassword}
        title="Change Password"
      >
        <form onSubmit={handleSubmitPassword(onChangePasswordSubmit)} className="flex flex-col gap-4 text-left">
          {passwordError && (
            <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-semibold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password changed successfully!</span>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            error={errorsPassword.currentPassword?.message}
            disabled={isChangingPassword}
            {...registerPassword('currentPassword')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errorsPassword.newPassword?.message}
            disabled={isChangingPassword}
            {...registerPassword('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errorsPassword.confirmNewPassword?.message}
            disabled={isChangingPassword}
            {...registerPassword('confirmNewPassword')}
          />

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseChangePassword}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppLayout;
