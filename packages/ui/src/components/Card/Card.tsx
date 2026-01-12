import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string;
  /** Card footer content */
  footer?: ReactNode;
}

/**
 * Card container component
 */
export function Card({ className, title, footer, children, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={cn('rounded-lg border border-secondary-200 bg-white shadow-sm', className)}
      {...props}
    >
      {title && (
        <div className="border-b border-secondary-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="border-t border-secondary-200 bg-secondary-50 px-6 py-4">{footer}</div>
      )}
    </div>
  );
}

/**
 * Card header component
 */
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('border-b border-secondary-200 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card content component
 */
export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card footer component
 */
export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('border-t border-secondary-200 bg-secondary-50 px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
