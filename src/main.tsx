import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">XE Academy Auth</p>
        <h1 className="text-2xl font-bold tracking-tight">Missing Clerk publishable key</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add <code className="rounded bg-slate-100 px-1.5 py-0.5">VITE_CLERK_PUBLISHABLE_KEY</code> to your environment to enable the custom Clerk authentication flow.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <MissingClerkConfig />
    )}
  </StrictMode>,
);
