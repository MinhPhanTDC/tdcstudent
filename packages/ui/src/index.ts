'use client';

// Utils
export { cn } from './utils/cn';
export { getErrorTranslationKey, getLocalizedErrorMessage } from './utils/errorMessages';

// Components
export { Button, type ButtonProps } from './components/Button';
export { Input, type InputProps } from './components/Input';
export { Select, type SelectProps, type SelectOption } from './components/Select';
export { TextArea, type TextAreaProps } from './components/TextArea';
export { Checkbox, type CheckboxProps } from './components/Checkbox';
export { Card, CardHeader, CardContent, CardFooter, type CardProps } from './components/Card';
export { Badge, type BadgeProps } from './components/Badge';
export { Avatar, type AvatarProps } from './components/Avatar';
export { Spinner, type SpinnerProps } from './components/Spinner';
export { Modal, type ModalProps } from './components/Modal';
export { ConfirmModal, type ConfirmModalProps } from './components/ConfirmModal';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { Toast, type ToastProps } from './components/Toast';
export { Table, type TableProps, type Column } from './components/Table';
export { ErrorBoundary } from './components/ErrorBoundary';
export { FormError, type FormErrorProps } from './components/FormError';
export { FormSuccess, type FormSuccessProps } from './components/FormSuccess';
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  type SkeletonProps,
} from './components/Skeleton';
export {
  Flipbook,
  calculateResponsiveDimensions,
  type FlipbookProps,
  type FlipbookDimensions,
} from './components/Flipbook';

// Contexts
export { TranslationProvider, useTranslation } from './contexts/TranslationContext';
export { ToastProvider, useToast } from './contexts/ToastContext';
