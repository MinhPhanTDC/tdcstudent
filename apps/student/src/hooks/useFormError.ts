import { useState, useCallback } from 'react';
import { type UseFormSetError, type FieldValues, type Path } from 'react-hook-form';
import { AppError, ErrorCode } from '@tdc/types';
import { useTranslation, getLocalizedErrorMessage } from '@tdc/ui';

/**
 * Field-level error mapping from error codes to form field names
 */
const ERROR_CODE_TO_FIELD: Record<string, string> = {
  [ErrorCode.WRONG_PASSWORD]: 'currentPassword',
  [ErrorCode.WEAK_PASSWORD]: 'newPassword',
};

interface UseFormErrorReturn<T extends FieldValues> {
  /** General form error message */
  formError: string | null;
  /** Set form error from AppError */
  setFormError: (error: AppError | Error | unknown) => void;
  /** Clear form error */
  clearFormError: () => void;
  /** Handle API error and map to form fields if applicable */
  handleApiError: (error: AppError | Error | unknown, setError?: UseFormSetError<T>) => void;
}

/**
 * Hook for handling form errors from API responses
 * Maps AppError codes to localized messages and form field errors
 */
export function useFormError<T extends FieldValues>(): UseFormErrorReturn<T> {
  const { t } = useTranslation();
  const [formError, setFormErrorState] = useState<string | null>(null);

  const setFormError = useCallback(
    (error: AppError | Error | unknown) => {
      if (error instanceof AppError) {
        const message = getLocalizedErrorMessage(error.code, t);
        setFormErrorState(message);
      } else if (error instanceof Error) {
        setFormErrorState(error.message);
      } else {
        setFormErrorState(t('errors.unknownError'));
      }
    },
    [t]
  );

  const clearFormError = useCallback(() => {
    setFormErrorState(null);
  }, []);

  const handleApiError = useCallback(
    (error: AppError | Error | unknown, setError?: UseFormSetError<T>) => {
      if (error instanceof AppError) {
        // Check if this error maps to a specific field
        const fieldName = ERROR_CODE_TO_FIELD[error.code];
        
        if (fieldName && setError) {
          // Set field-level error
          const message = getLocalizedErrorMessage(error.code, t);
          setError(fieldName as Path<T>, { type: 'manual', message });
        } else {
          // Set form-level error
          const message = getLocalizedErrorMessage(error.code, t);
          setFormErrorState(message);
        }

        // Handle validation errors with field details
        if (error.code === ErrorCode.VALIDATION_ERROR && error.details && setError) {
          const fieldErrors = error.details.fieldErrors as Record<string, string[]> | undefined;
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                setError(field as Path<T>, { type: 'manual', message: messages[0] });
              }
            });
          }
        }
      } else if (error instanceof Error) {
        setFormErrorState(error.message);
      } else {
        setFormErrorState(t('errors.unknownError'));
      }
    },
    [t]
  );

  return {
    formError,
    setFormError,
    clearFormError,
    handleApiError,
  };
}
