interface XeLogoProps {
  /** 'full' = icon + "ACADEMY" wordmark. 'icon' = mark only, for compact/mobile nav. */
  variant?: 'full' | 'icon';
  /** 'light' = indigo mark for white/light backgrounds. 'dark' = white mark for dark/photo backgrounds. */
  theme?: 'light' | 'dark';
  className?: string;
}

// Renders the approved brand asset for the given context — never recolors
// or distorts the mark. See public/brand/ for the source files.
export function XeLogo({ variant = 'full', theme = 'light', className }: XeLogoProps) {
  const color = theme === 'dark' ? 'white' : 'indigo';
  return <img src={`/brand/logo-${variant}-${color}.svg`} alt="XE Academy" className={className} />;
}
