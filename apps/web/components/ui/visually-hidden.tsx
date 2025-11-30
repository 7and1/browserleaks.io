import { cn } from '@/lib/utils';

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Only hide when not focused */
  focusable?: boolean;
}

/**
 * Visually hidden text for screen readers
 * Implements WCAG 2.1 recommended pattern for visually hidden content
 */
export function VisuallyHidden({
  children,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        '[clip:rect(0,0,0,0)]',
        focusable && 'focus:static focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:[clip:auto]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Live region for dynamic announcements
 */
export function LiveRegion({
  message,
  role = 'status',
  politeness = 'polite',
}: {
  message: string;
  role?: 'status' | 'alert' | 'log';
  politeness?: 'polite' | 'assertive' | 'off';
}) {
  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
