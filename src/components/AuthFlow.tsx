import { FormEvent, useMemo, useState } from 'react';
import { useAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, BookOpen, Check, GraduationCap, Loader2, RadioTower, ShieldCheck } from 'lucide-react';
import { AuthRole, creatorCategories, extractClerkError, getRoleDashboardPath } from '../lib/auth';
import { XeLogo } from './XeLogo';

type AuthMode = 'sign-in' | 'sign-up' | 'verify-email' | 'reset-password' | 'onboarding';

interface AuthFlowProps {
  initialMode?: AuthMode;
  initialRole?: AuthRole | null;
  onBackHome: () => void;
}

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function SubmitButton({ children, loading }: { children: string; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function OAuthButton({ label, onClick, disabled, icon }: { label: string; onClick: () => void; disabled: boolean; icon: 'google' | 'apple' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon === 'google' ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.365 1.43c0 1.14-.465 2.22-1.215 3.03-.825.885-2.19 1.56-3.27 1.47-.15-1.095.435-2.235 1.185-3.03.825-.87 2.25-1.53 3.3-1.47Zm3.96 16.77c-.585 1.35-.87 1.95-1.62 3.15-1.05 1.605-2.535 3.6-4.38 3.615-1.635.015-2.055-1.065-4.275-1.05-2.22.015-2.685 1.08-4.32 1.065-1.845-.015-3.255-1.815-4.305-3.42-2.94-4.5-3.255-9.765-1.44-12.57 1.29-1.995 3.33-3.165 5.25-3.165 1.95 0 3.18 1.08 4.8 1.08 1.575 0 2.535-1.08 4.8-1.08 1.71 0 3.525.93 4.815 2.535-4.23 2.325-3.54 8.37.675 9.84Z" />
        </svg>
      )}
      {label}
    </button>
  );
}

export function AuthFlow({ initialMode = 'sign-in', initialRole = null, onBackHome }: AuthFlowProps) {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const roleFromMetadata = user?.publicMetadata?.role as string | undefined;
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<AuthRole | null>((roleFromMetadata as AuthRole) || initialRole);
  const [selectedCategories, setSelectedCategories] = useState<string[]>((user?.publicMetadata?.categories as string[]) || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: '', password: '', remember: true });
  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const title = useMemo(() => {
    if (mode === 'sign-up') return 'Create your XE Academy account';
    if (mode === 'verify-email') return 'Verify your email';
    if (mode === 'reset-password') return 'Reset your password';
    if (mode === 'onboarding') return 'Personalize your workspace';
    return 'Student Portal Access';
  }, [mode]);

  const beginOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    setError('');
    setLoading(true);
    try {
      const resource = mode === 'sign-up' && signUpLoaded ? signUp : signIn;
      await resource?.authenticateWithRedirect({
        strategy,
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch (err) {
      setError(extractClerkError(err));
      setLoading(false);
    }
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!signInLoaded) return;
    setError('');
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: signInForm.email,
        password: signInForm.password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        window.location.href = '/';
      }
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    if (!signUpLoaded) return;
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await signUp.create({
        firstName: signUpForm.firstName,
        lastName: signUpForm.lastName,
        emailAddress: signUpForm.email,
        password: signUpForm.password,
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        setMode('onboarding');
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setMode('verify-email');
      }
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!signUpLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        setMode('onboarding');
      }
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!signInLoaded) return;
    setError('');
    setLoading(true);
    try {
      if (!resetRequested) {
        await signIn.create({
          strategy: 'reset_password_email_code',
          identifier: resetEmail,
        });
        setResetRequested(true);
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: 'reset_password_email_code',
          code: resetCode,
          password: resetPassword,
        });

        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          window.location.href = '/';
        }
      }
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const persistMetadata = async () => {
    if (!selectedRole) {
      setError('Choose Student or Creator to continue.');
      return;
    }
    if (selectedRole === 'creator' && (selectedCategories.length < 1 || selectedCategories.length > 3)) {
      setError('Select 1 to 3 teaching categories.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/clerk/update-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: selectedRole,
          categories: selectedRole === 'creator' ? selectedCategories : [],
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to save onboarding metadata.');

      await user?.reload();
      window.location.href = getRoleDashboardPath(selectedRole);
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setError('');
    setSelectedCategories((current) => {
      if (current.includes(category)) return current.filter((item) => item !== category);
      if (current.length >= 3) return current;
      return [...current, category];
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#ede9fe_0,#f8fafc_34%,#ffffff_72%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-10">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)] lg:min-h-[calc(100vh-80px)] lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#111827_0%,#312e81_46%,#6d28d9_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-white/12" />
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute bottom-10 right-12 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative z-10">
            <button onClick={onBackHome} className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-indigo-100/80 transition-colors hover:text-white">
              <ArrowLeft size={16} />
              Back to Home
            </button>
            <div className="mb-14 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-violet-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              XE Academy
            </div>
            <h1 className="max-w-xl text-5xl font-extrabold leading-[1.03] tracking-tight xl:text-6xl">
              Welcome Back. Keep learning. Keep growing.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-indigo-100/80">
              Secure access, persistent sessions, and personalized dashboards for students and creators.
            </p>
          </div>

          <div className="relative z-10 mx-auto my-10 h-[340px] w-full max-w-[520px]">
            <motion.div animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-8 top-6 rounded-2xl border border-white/18 bg-white/14 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-indigo-700">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold">Course Completed</p>
                  <p className="text-xs text-indigo-100/70">84% learning velocity</p>
                </div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-5 top-28 rounded-2xl border border-white/18 bg-white/14 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-300 text-slate-950">
                  <RadioTower size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Live Class</p>
                  <p className="text-xs text-indigo-100/70">Starting soon</p>
                </div>
              </div>
            </motion.div>

            <svg className="absolute left-1/2 top-14 h-64 w-64 -translate-x-1/2" viewBox="0 0 240 240" fill="none" aria-hidden="true">
              <circle cx="120" cy="120" r="94" fill="white" opacity="0.12" />
              <rect x="72" y="96" width="96" height="68" rx="20" fill="#F8FAFC" />
              <path d="M86 110h68M86 126h48M86 142h36" stroke="#4338CA" strokeWidth="7" strokeLinecap="round" />
              <circle cx="120" cy="73" r="28" fill="#FBBF24" />
              <path d="M99 183c5-26 37-26 42 0" stroke="#F8FAFC" strokeWidth="16" strokeLinecap="round" />
              <path d="M94 175c9-20 43-20 52 0" stroke="#7C3AED" strokeWidth="14" strokeLinecap="round" />
              <rect x="88" y="64" width="64" height="40" rx="20" fill="#111827" />
              <circle cx="107" cy="84" r="4" fill="#F8FAFC" />
              <circle cx="133" cy="84" r="4" fill="#F8FAFC" />
              <path d="M111 96c7 5 13 5 20 0" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur">
            <div><p className="text-2xl font-extrabold">50K+</p><p className="mt-1 text-xs font-medium text-indigo-100/70">Learners</p></div>
            <div><p className="text-2xl font-extrabold">98%</p><p className="mt-1 text-xs font-medium text-indigo-100/70">Satisfaction</p></div>
            <div><p className="text-2xl font-extrabold">2K+</p><p className="mt-1 text-xs font-medium text-indigo-100/70">Creators</p></div>
          </div>
        </aside>

        <section className="relative flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute left-0 top-0 hidden h-full w-24 bg-gradient-to-r from-indigo-50/70 to-transparent lg:block" />
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 lg:mx-0">
                <XeLogo variant="icon" theme="dark" className="h-6 w-auto" />
              </div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-indigo-600">Secure portal</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'onboarding' ? 'Choose the workspace that fits your XE Academy journey.' : 'Continue with secure Clerk authentication and XE Academy personalization.'}
              </p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

            {mode === 'sign-in' && (
              <>
                <form onSubmit={handleSignIn} className="space-y-5">
                  <Field label="Email Address" type="email" value={signInForm.email} onChange={(email) => setSignInForm((form) => ({ ...form, email }))} placeholder="name@company.com" />
                  <Field label="Password" type="password" value={signInForm.password} onChange={(password) => setSignInForm((form) => ({ ...form, password }))} placeholder="••••••••" />
                  <div className="flex items-center justify-between px-1">
                    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-500">
                      <input className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" type="checkbox" checked={signInForm.remember} onChange={(event) => setSignInForm((form) => ({ ...form, remember: event.target.checked }))} />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setMode('reset-password')} className="text-sm font-semibold text-indigo-600 transition-colors hover:text-violet-700">Forgot password?</button>
                  </div>
                  <SubmitButton loading={loading}>Sign In</SubmitButton>
                </form>
                <div className="my-8 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-bold uppercase tracking-widest text-slate-400">or continue with</span><div className="h-px flex-1 bg-slate-200" /></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <OAuthButton icon="google" label="Google" disabled={loading} onClick={() => beginOAuth('oauth_google')} />
                  <OAuthButton icon="apple" label="Apple" disabled={loading} onClick={() => beginOAuth('oauth_apple')} />
                </div>
                <p className="mt-8 text-center text-sm text-slate-500">New to XE Academy? <button onClick={() => setMode('sign-up')} className="font-semibold text-indigo-600 hover:text-violet-700">Create Account</button></p>
              </>
            )}

            {mode === 'sign-up' && (
              <>
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First Name" value={signUpForm.firstName} onChange={(firstName) => setSignUpForm((form) => ({ ...form, firstName }))} placeholder="Ava" />
                    <Field label="Last Name" value={signUpForm.lastName} onChange={(lastName) => setSignUpForm((form) => ({ ...form, lastName }))} placeholder="Chen" />
                  </div>
                  <Field label="Email Address" type="email" value={signUpForm.email} onChange={(email) => setSignUpForm((form) => ({ ...form, email }))} placeholder="name@company.com" />
                  <Field label="Password" type="password" value={signUpForm.password} onChange={(password) => setSignUpForm((form) => ({ ...form, password }))} placeholder="Create a strong password" />
                  <Field label="Confirm Password" type="password" value={signUpForm.confirmPassword} onChange={(confirmPassword) => setSignUpForm((form) => ({ ...form, confirmPassword }))} placeholder="Confirm password" />
                  <SubmitButton loading={loading}>Create Account</SubmitButton>
                </form>
                <div className="my-8 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-bold uppercase tracking-widest text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" /></div>
                <OAuthButton icon="google" label="Continue with Google" disabled={loading} onClick={() => beginOAuth('oauth_google')} />
                <p className="mt-8 text-center text-sm text-slate-500">Already have an account? <button onClick={() => setMode('sign-in')} className="font-semibold text-indigo-600 hover:text-violet-700">Sign In</button></p>
              </>
            )}

            {mode === 'verify-email' && (
              <form onSubmit={handleVerifyEmail} className="space-y-5">
                <Field label="Verification Code" value={verificationCode} onChange={setVerificationCode} placeholder="Enter the 6-digit code" />
                <SubmitButton loading={loading}>Verify Email</SubmitButton>
              </form>
            )}

            {mode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <Field label="Email Address" type="email" value={resetEmail} onChange={setResetEmail} placeholder="name@company.com" />
                {resetRequested && (
                  <>
                    <Field label="Reset Code" value={resetCode} onChange={setResetCode} placeholder="Enter reset code" />
                    <Field label="New Password" type="password" value={resetPassword} onChange={setResetPassword} placeholder="Create a new password" />
                  </>
                )}
                <SubmitButton loading={loading}>{resetRequested ? 'Save New Password' : 'Send Reset Code'}</SubmitButton>
                <button type="button" onClick={() => setMode('sign-in')} className="w-full text-sm font-semibold text-indigo-600 hover:text-violet-700">Back to Sign In</button>
              </form>
            )}

            {mode === 'onboarding' && userLoaded && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { role: 'student' as AuthRole, title: "I'm a Student", icon: GraduationCap, copy: 'Learn, track progress, and join live sessions.' },
                    { role: 'creator' as AuthRole, title: "I'm a Creator", icon: RadioTower, copy: 'Publish courses and run your creator studio.' },
                  ].map((option) => {
                    const Icon = option.icon;
                    const active = selectedRole === option.role;
                    return (
                      <button
                        key={option.role}
                        type="button"
                        onClick={() => setSelectedRole(option.role)}
                        className={`rounded-3xl border p-5 text-left transition-all active:scale-[0.98] ${active ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className={`grid h-12 w-12 place-items-center rounded-2xl ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon size={22} /></div>
                          {active && <Check className="text-indigo-600" size={20} />}
                        </div>
                        <h3 className="font-bold text-slate-950">{option.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{option.copy}</p>
                      </button>
                    );
                  })}
                </div>

                {selectedRole === 'creator' && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <BadgeCheck size={18} className="text-indigo-600" />
                      <h3 className="font-bold text-slate-950">What do you teach?</h3>
                    </div>
                    <p className="mb-4 text-sm text-slate-500">Select 1 to 3 categories. Students will later use these as course catalog filters.</p>
                    <div className="flex flex-wrap gap-2">
                      {creatorCategories.map((category) => {
                        const active = selectedCategories.includes(category);
                        return (
                          <button key={category} type="button" onClick={() => toggleCategory(category)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${active ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-indigo-600 hover:ring-indigo-200'}`}>
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button onClick={persistMetadata} disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Finish Onboarding
                </button>
              </div>
            )}
          </motion.div>
        </section>
      </section>
    </div>
  );
}
