'use client';

import { useSkipToMain } from '@/lib/accessibility';

export function SkipLink() {
  const handleSkip = useSkipToMain();

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      onKeyDown={(e) => e.key === 'Enter' && handleSkip(e)}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[9999]
        px-4 py-2
        bg-blue-600 text-white
        rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950
        transition-all
      "
    >
      Skip to main content
    </a>
  );
}
