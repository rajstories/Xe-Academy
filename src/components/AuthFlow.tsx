import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Check, GraduationCap, Loader2, RadioTower, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-1.5">
      <label className="ml-0.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label} {required && <span className="text-indigo-500">*</span>}
      </label>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-amber-200 to-amber-400 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-400/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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

  const heroSlides = ['/hero-img-1.jpg', '/hero-img-2.png', '/hero-img-3.png', '/hero-img-4.jpg'];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const title = useMemo(() => {
    if (mode === 'sign-up') return 'Create your XE Academy account';
    if (mode === 'verify-email') return 'Verify your email';
    if (mode === 'reset-password') return 'Reset your password';
    if (mode === 'onboarding') return 'Personalize your workspace';
    return 'Sign in';
  }, [mode]);

  const eyebrow = useMemo(() => {
    if (mode === 'sign-up' && selectedRole === 'student') return 'Student Portal';
    if (mode === 'sign-up' && selectedRole === 'creator') return 'Creator Portal';
    if (mode === 'sign-up') return 'XE Academy Portal';
    if (mode === 'sign-in' && selectedRole === 'student') return 'Student Portal Access';
    if (mode === 'sign-in' && selectedRole === 'creator') return 'Creator Portal Access';
    if (mode === 'sign-in') return 'Welcome Back';
    return 'Secure Access';
  }, [mode, selectedRole]);

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
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#ede9fe_0,#f8fafc_34%,#ffffff_72%)] px-3 py-3 text-slate-900 sm:px-5 sm:py-5 lg:h-screen lg:overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-7xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)] sm:min-h-[calc(100vh-40px)] lg:h-[calc(100vh-40px)] lg:min-h-0 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
          {/* background slideshow */}
          <div className="absolute inset-0" aria-hidden="true">
            {heroSlides.map((src, index) => (
              <div
                key={src}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ease-in-out"
                style={{ backgroundImage: `url(${src})`, opacity: index === activeSlide ? 1 : 0 }}
              />
            ))}
          </div>
          {/* readability overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

          <div className="relative z-10">
            <button onClick={onBackHome} className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-200/80 transition-colors hover:text-white">
              <ArrowLeft size={16} />
              Back to Home
            </button>

            <div className="flex items-center">
              <XeLogo variant="full" theme="dark" className="h-8 w-auto" />
            </div>

            <h1 className="mt-10 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl">
              Where creators, brands &amp; learners grow together.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-200/85 xl:text-base">
              One creative studio for teachers, creators, and teams — build courses, go live, reach your audience, and partner with the brands you love.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex items-center">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&h=128&fit=crop&crop=faces" alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-900/60" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=128&h=128&fit=crop&crop=faces" alt="" className="-ml-2 h-10 w-10 rounded-full object-cover ring-2 ring-slate-900/60" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=128&h=128&fit=crop&crop=faces" alt="" className="-ml-2 h-10 w-10 rounded-full object-cover ring-2 ring-slate-900/60" />
              <span className="-ml-2 grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-black text-indigo-700 ring-2 ring-slate-900/60">+9</span>
            </div>
            <p className="text-sm text-slate-200/90">
              Rated <span className="font-extrabold text-white">4.9/5</span> by 50,000+ learners
            </p>
          </div>
        </aside>

        <section className="relative flex items-center justify-center overflow-y-auto bg-white px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="absolute left-0 top-0 hidden h-full w-24 bg-gradient-to-r from-indigo-50/70 to-transparent lg:block" />
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-[440px]">
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-indigo-600">
                {eyebrow}
              </p>
              <h2 className="max-w-[410px] text-3xl font-extrabold leading-[1.04] tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
              {mode !== 'sign-up' && (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {mode === 'onboarding'
                    ? 'Choose the workspace that fits your XE Academy journey.'
                    : <>Pick up right where you left off. <button type="button" onClick={() => setMode('sign-up')} className="font-semibold text-indigo-600 hover:text-violet-700">Create an account</button></>}
                </p>
              )}
            </div>

            {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

            {mode === 'sign-in' && (
              <>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Email" type="email" value={signInForm.email} onChange={(email) => setSignInForm((form) => ({ ...form, email }))} placeholder="name@company.com" />
                    <Field label="Password" type="password" value={signInForm.password} onChange={(password) => setSignInForm((form) => ({ ...form, password }))} placeholder="••••••••" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="space-y-2.5">
                    <OAuthButton icon="google" label="Continue with Google" disabled={loading} onClick={() => beginOAuth('oauth_google')} />
                    <OAuthButton icon="apple" label="Continue with Apple" disabled={loading} onClick={() => beginOAuth('oauth_apple')} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-500">
                      <input className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" type="checkbox" checked={signInForm.remember} onChange={(event) => setSignInForm((form) => ({ ...form, remember: event.target.checked }))} />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setMode('reset-password')} className="text-sm font-semibold text-indigo-600 transition-colors hover:text-violet-700">Forgot password?</button>
                  </div>

                  <SubmitButton loading={loading}>Sign in</SubmitButton>

                  <p className="text-center text-sm text-slate-500">
                    Don't have an account?
                    <button type="button" onClick={() => setMode('sign-up')} className="ml-1 font-semibold text-indigo-600 hover:text-violet-700">Create an account</button>
                  </p>
                </form>
              </>
            )}

            {mode === 'sign-up' && (
              <>
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First Name" value={signUpForm.firstName} onChange={(firstName) => setSignUpForm((form) => ({ ...form, firstName }))} placeholder="Ava" />
                    <Field label="Last Name" value={signUpForm.lastName} onChange={(lastName) => setSignUpForm((form) => ({ ...form, lastName }))} placeholder="Chen" />
                  </div>
                  <Field label="Email Address" type="email" value={signUpForm.email} onChange={(email) => setSignUpForm((form) => ({ ...form, email }))} placeholder="name@company.com" />
                  <Field label="Password" type="password" value={signUpForm.password} onChange={(password) => setSignUpForm((form) => ({ ...form, password }))} placeholder="Create a strong password" />
                  <Field label="Confirm Password" type="password" value={signUpForm.confirmPassword} onChange={(confirmPassword) => setSignUpForm((form) => ({ ...form, confirmPassword }))} placeholder="Confirm password" />
                  <SubmitButton loading={loading}>Create Account</SubmitButton>
                </form>
                <div className="my-5 flex items-center gap-4"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-bold uppercase tracking-widest text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" /></div>
                <div className="space-y-2.5">
                  <OAuthButton icon="google" label="Continue with Google" disabled={loading} onClick={() => beginOAuth('oauth_google')} />
                  <OAuthButton icon="apple" label="Continue with Apple" disabled={loading} onClick={() => beginOAuth('oauth_apple')} />
                </div>
                <p className="mt-5 text-center text-sm text-slate-500">Already have an account? <button onClick={() => setMode('sign-in')} className="font-semibold text-indigo-600 hover:text-violet-700">Sign In</button></p>
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
