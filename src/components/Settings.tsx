'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser, useClerk, useSignIn } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Monitor,
  Save,
  Camera,
  Loader2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  Laptop,
  LogOut,
  Wallet,
  Moon,
  Sparkles,
} from 'lucide-react';
import { View } from '../types';
import { getFullName, getInitials, extractClerkError } from '../lib/auth';

interface Props {
  setView: (view: View) => void;
}

/* ------------------------------------------------------------------ */
/* Toast system                                                        */
/* ------------------------------------------------------------------ */

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (type: Toast['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));

  return { toasts, push, dismiss };
}

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 max-w-[calc(100vw-3rem)]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-lg shadow-slate-900/5 ${
              toast.type === 'success' ? 'border-emerald-200' : 'border-red-200'
            }`}
          >
            <div
              className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full ${
                toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            </div>
            <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="text-slate-300 transition-colors hover:text-slate-500">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-slate-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SpinnerButton({
  loading,
  children,
  className = '',
  ...props
}: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Profile tab                                                         */
/* ------------------------------------------------------------------ */

function ProfileTab({ pushToast }: { pushToast: (type: Toast['type'], message: string) => void }) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = getFullName(user || undefined);
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(
    user?.username || ((user?.unsafeMetadata?.username as string) ?? '')
  );
  const [bio, setBio] = useState((user?.unsafeMetadata?.bio as string) ?? '');

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setUsername(user.username || ((user.unsafeMetadata?.username as string) ?? ''));
    setBio((user.unsafeMetadata?.bio as string) ?? '');
  }, [user?.id]);

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      pushToast('error', 'Please choose an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      pushToast('error', 'Image must be smaller than 10MB.');
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      pushToast('success', 'Profile photo updated.');
    } catch (error) {
      setLocalPreview(null);
      pushToast('error', extractClerkError(error));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setAvatarUploading(true);
    try {
      await user.setProfileImage({ file: null });
      await user.reload();
      setLocalPreview(null);
      pushToast('success', 'Profile photo removed.');
    } catch (error) {
      pushToast('error', extractClerkError(error));
    } finally {
      setAvatarUploading(false);
    }
  };

  const hasCustomImage = Boolean(user?.hasImage);
  const displayedImage = localPreview || (hasCustomImage ? user?.imageUrl : null);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const trimmedUsername = username.trim();
      const updatePayload: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          bio: bio.trim(),
          username: trimmedUsername,
        },
      };

      // Only attempt the first-class username field when the instance enables it.
      if (trimmedUsername && user.username !== trimmedUsername) {
        try {
          await user.update({ username: trimmedUsername });
        } catch {
          // Username not enabled on this Clerk instance — fall back to metadata only.
        }
      }

      await user.update(updatePayload);
      await user.reload();
      pushToast('success', 'Profile updated successfully');
    } catch (error) {
      pushToast('error', extractClerkError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-1">Profile Information</h3>
        <p className="text-sm text-text-secondary mb-6">Update your personal information and public profile.</p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="group relative h-24 w-24 overflow-hidden rounded-full border border-border bg-gray-100"
            >
              {displayedImage ? (
                <img src={displayedImage} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                  {getInitials(fullName)}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={20} />
              </span>
              {avatarUploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <Loader2 size={22} className="animate-spin" />
                </span>
              )}
            </button>
            {(hasCustomImage || localPreview) && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={avatarUploading}
                className="text-xs font-medium text-text-secondary transition-colors hover:text-danger disabled:opacity-50"
              >
                Remove photo
              </button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-text-primary">{fullName}</p>
            <p className="text-sm text-text-secondary">{email}</p>
            <p className="mt-2 text-xs text-text-secondary/80">Click the avatar to upload a new photo. JPG or PNG, up to 10MB.</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">@</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))}
                placeholder="username"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm text-text-secondary cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-text-secondary/80">Contact support to change your email address.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell us a little about yourself."
              className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <SpinnerButton
          loading={saving}
          onClick={handleSave}
          className="px-6 py-2.5 bg-primary text-white hover:bg-primary-hover shadow-sm"
        >
          {!saving && <Save size={18} />}
          Save Changes
        </SpinnerButton>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications tab                                                   */
/* ------------------------------------------------------------------ */

interface NotificationPrefs {
  newLesson: boolean;
  liveReminders: boolean;
  certificates: boolean;
  securityAlerts: boolean;
  billingReceipts: boolean;
  productUpdates: boolean;
  promotions: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  newLesson: true,
  liveReminders: true,
  certificates: true,
  securityAlerts: true,
  billingReceipts: true,
  productUpdates: false,
  promotions: false,
};

const NOTIFICATION_GROUPS: { group: string; items: { key: keyof NotificationPrefs; label: string; description: string }[] }[] = [
  {
    group: 'Course updates',
    items: [
      { key: 'newLesson', label: 'New lesson published', description: 'Get notified when a course you follow adds a lesson.' },
      { key: 'liveReminders', label: 'Live session reminders', description: 'A heads-up before your live sessions begin.' },
      { key: 'certificates', label: 'Course completion certificates', description: 'When a certificate is ready to download.' },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'securityAlerts', label: 'Security alerts', description: 'Important alerts about your account security.' },
      { key: 'billingReceipts', label: 'Billing receipts', description: 'Receipts and invoices for your purchases.' },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { key: 'productUpdates', label: 'Product updates & tips', description: 'Occasional product news and learning tips.' },
      { key: 'promotions', label: 'Promotional offers', description: 'Discounts and special offers from XE Academy.' },
    ],
  },
];

function NotificationsTab({ pushToast }: { pushToast: (type: Toast['type'], message: string) => void }) {
  const { user } = useUser();
  const stored = (user?.unsafeMetadata?.notificationPreferences as Partial<NotificationPrefs>) || {};
  const [prefs, setPrefs] = useState<NotificationPrefs>({ ...DEFAULT_PREFS, ...stored });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          notificationPreferences: prefs,
        },
      });
      await user.reload();
      setDirty(false);
      pushToast('success', 'Notification preferences saved.');
    } catch (error) {
      pushToast('error', extractClerkError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-1">Notifications</h3>
        <p className="text-sm text-text-secondary">Choose what you want to hear about. You can change these anytime.</p>
      </div>

      <div className="space-y-8">
        {NOTIFICATION_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary/70">{group.group}</p>
            <div className="divide-y divide-border/60 rounded-2xl border border-border/60">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-secondary">{item.description}</p>
                  </div>
                  <Toggle checked={prefs[item.key]} onChange={() => toggle(item.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <SpinnerButton
          loading={saving}
          disabled={!dirty}
          onClick={handleSave}
          className="px-6 py-2.5 bg-primary text-white hover:bg-primary-hover shadow-sm"
        >
          {!saving && <Save size={18} />}
          Save Preferences
        </SpinnerButton>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Security tab                                                        */
/* ------------------------------------------------------------------ */

interface ActiveSession {
  id: string;
  isCurrent: boolean;
  device: string;
  browser: string;
  location: string;
  isMobile: boolean;
  revoke: () => Promise<unknown>;
}

function SecurityTab({ pushToast }: { pushToast: (type: Toast['type'], message: string) => void }) {
  const { user } = useUser();
  const { session, signIn } = useClerkSecurity();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changing, setChanging] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const strongEnough = newPassword.length >= 8;
  const canSubmit = currentPassword.length > 0 && strongEnough && passwordsMatch;

  const loadSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    try {
      const result = await user.getSessions();
      const mapped: ActiveSession[] = result.map((item) => {
        const activity = item.latestActivity;
        return {
          id: item.id,
          isCurrent: item.id === session?.id,
          device: activity?.deviceType || (activity?.isMobile ? 'Mobile device' : 'Desktop'),
          browser: [activity?.browserName, activity?.browserVersion].filter(Boolean).join(' ') || 'Unknown browser',
          location: [activity?.city, activity?.country].filter(Boolean).join(', ') || 'Unknown location',
          isMobile: Boolean(activity?.isMobile),
          revoke: () => item.revoke(),
        };
      });
      // Current session first.
      mapped.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
      setSessions(mapped);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleChangePassword = async () => {
    if (!user || !canSubmit) return;
    setChanging(true);
    try {
      await user.updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      pushToast('success', 'Password updated successfully.');
    } catch (error) {
      pushToast('error', extractClerkError(error));
    } finally {
      setChanging(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email || !signIn) return;
    setSendingReset(true);
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      setResetSent(true);
      pushToast('success', 'Password reset email sent.');
    } catch (error) {
      pushToast('error', extractClerkError(error));
    } finally {
      setSendingReset(false);
    }
  };

  const handleRevoke = async (target: ActiveSession) => {
    try {
      await target.revoke();
      pushToast('success', 'Session signed out.');
      loadSessions();
    } catch (error) {
      pushToast('error', extractClerkError(error));
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      const others = sessions.filter((item) => !item.isCurrent);
      await Promise.all(others.map((item) => item.revoke()));
      pushToast('success', 'Signed out of all other devices.');
      loadSessions();
    } catch (error) {
      pushToast('error', extractClerkError(error));
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessionCount = sessions.filter((item) => !item.isCurrent).length;

  return (
    <div className="space-y-10 animate-in fade-in">
      {/* Change password */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-1">Password &amp; Security</h3>
        <p className="text-sm text-text-secondary mb-6">Keep your account secure with a strong password.</p>

        <div className="rounded-2xl border border-border/60 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-primary" />
            <h4 className="text-sm font-bold text-text-primary">Change Password</h4>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {newPassword.length > 0 && !strongEnough && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle size={12} /> Use at least 8 characters.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} /> Passwords do not match.
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                  <Check size={12} /> Passwords match.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <SpinnerButton
                loading={changing}
                disabled={!canSubmit}
                onClick={handleChangePassword}
                className="px-5 py-2.5 bg-primary text-white hover:bg-primary-hover shadow-sm"
              >
                Update Password
              </SpinnerButton>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                {sendingReset ? 'Sending…' : 'Forgot your current password?'}
              </button>
            </div>

            {resetSent && (
              <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
                <Check size={16} className="mt-0.5 flex-shrink-0" />
                We've sent a password reset link to your email. Please check your inbox.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h4 className="text-sm font-bold text-text-primary">Active Sessions</h4>
          </div>
          {otherSessionCount > 0 && (
            <SpinnerButton
              loading={revokingAll}
              onClick={handleRevokeAll}
              className="px-3.5 py-2 border border-border text-text-primary hover:bg-gray-50"
            >
              {!revokingAll && <LogOut size={14} />}
              Sign out of all devices
            </SpinnerButton>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 divide-y divide-border/60">
          {loadingSessions ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary">
              <Loader2 size={16} className="animate-spin" /> Loading sessions…
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-sm text-text-secondary">No active sessions found.</div>
          ) : (
            sessions.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    {item.isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      {item.browser}
                      {item.isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {item.device} · {item.location}
                    </p>
                  </div>
                </div>
                {!item.isCurrent && (
                  <button
                    onClick={() => handleRevoke(item)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Two-factor */}
      <div>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                Two-factor authentication
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Coming soon
                </span>
              </p>
              <p className="text-xs text-text-secondary">Add an extra layer of security to your account at sign-in.</p>
            </div>
          </div>
          <Toggle checked={false} disabled />
        </div>
      </div>
    </div>
  );
}

// Small wrapper so SecurityTab can pull session + signIn without re-rendering the parent on every Clerk change.
function useClerkSecurity() {
  const { session } = useClerk();
  const { signIn } = useSignIn();
  return { session, signIn };
}

/* ------------------------------------------------------------------ */
/* Billing tab                                                         */
/* ------------------------------------------------------------------ */

function BillingTab({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="animate-in fade-in">
      <h3 className="text-lg font-bold text-text-primary mb-1">Billing</h3>
      <p className="text-sm text-text-secondary mb-8">Manage your subscription, payment methods, and invoices.</p>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/5 text-primary">
          <Wallet size={30} />
        </div>
        <h4 className="text-base font-bold text-text-primary">No active subscription</h4>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          You're currently on the Free tier. Billing and invoices will appear here once you upgrade.
        </p>
        <button
          onClick={onUpgrade}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          View Plans
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Appearance tab                                                      */
/* ------------------------------------------------------------------ */

function AppearanceTab() {
  return (
    <div className="animate-in fade-in">
      <h3 className="text-lg font-bold text-text-primary mb-1">Appearance</h3>
      <p className="text-sm text-text-secondary mb-8">Personalize how XE Academy looks for you.</p>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Moon size={30} />
        </div>
        <h4 className="text-base font-bold text-text-primary">Dark mode is on its way 🌙</h4>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          We're polishing our dark theme to make sure it's just as good as the light one. In the meantime, enjoy the clean
          look of XE Academy in light mode.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-5 opacity-70">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <Moon size={18} />
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
              Dark Theme
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                Coming Soon
              </span>
            </p>
            <p className="text-xs text-text-secondary">Switch to a darker interface for low-light environments.</p>
          </div>
        </div>
        <Toggle checked={false} disabled />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Upgrade modal                                                       */
/* ------------------------------------------------------------------ */

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useUser();
  const [notify, setNotify] = useState(Boolean(user?.unsafeMetadata?.notifyOnPremiumLaunch));
  const [saving, setSaving] = useState(false);

  const handleClose = async () => {
    if (notify && user && !user.unsafeMetadata?.notifyOnPremiumLaunch) {
      setSaving(true);
      try {
        await user.update({
          unsafeMetadata: { ...(user.unsafeMetadata || {}), notifyOnPremiumLaunch: true },
        });
      } catch {
        // best-effort; closing regardless
      } finally {
        setSaving(false);
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
          >
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 text-white shadow-lg shadow-primary/30">
              <Sparkles size={26} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Premium membership is on the way 🚀</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              We haven't launched our premium plans just yet — but thanks for your interest! We'll let you know the moment
              it's ready. Until then, enjoy full access to our Free tier.
            </p>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 px-4 py-3">
              <input
                type="checkbox"
                checked={notify}
                onChange={(event) => setNotify(event.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span className="text-sm font-medium text-text-primary">Notify me when it launches</span>
            </label>

            <button
              onClick={handleClose}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Settings shell                                                      */
/* ------------------------------------------------------------------ */

export default function Settings(_props: Props) {
  const [activeTab, setActiveTab] = useState('profile');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { toasts, push, dismiss } = useToasts();

  const tabs = useMemo(
    () => [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Lock },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'appearance', label: 'Appearance', icon: Monitor },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12 max-w-5xl mx-auto w-full">
      <ToastViewport toasts={toasts} dismiss={dismiss} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-left
                  ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'}`}
              >
                <tab.icon size={18} className={isActive ? 'text-primary' : 'text-text-secondary'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-surface border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
          {activeTab === 'profile' && <ProfileTab pushToast={push} />}
          {activeTab === 'notifications' && <NotificationsTab pushToast={push} />}
          {activeTab === 'security' && <SecurityTab pushToast={push} />}
          {activeTab === 'billing' && <BillingTab onUpgrade={() => setUpgradeOpen(true)} />}
          {activeTab === 'appearance' && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
}
