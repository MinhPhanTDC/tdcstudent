'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUpdateProgress } from './useTracking';
import type { UpdateProgressInput } from '@tdc/schemas';

/**
 * Inline edit field type
 */
export type InlineEditField = 'sessions' | 'projects' | 'projectLinks';

/**
 * Inline edit state
 */
export interface InlineEditState {
  isEditing: boolean;
  field: InlineEditField | null;
  progressId: string | null;
  originalValue: number | string[] | null;
  currentValue: number | string[] | null;
  error: string | null;
  isSaving: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validation function type
 */
export type ValidateFn = (value: number | string[]) => ValidationResult;

/**
 * Default validation - always valid
 */
const defaultValidate: ValidateFn = () => ({ isValid: true });

/**
 * Hook to manage inline edit state with auto-save
 * Requirements: 2.1, 2.2, 2.3
 * 
 * This hook manages:
 * - Inline edit state for sessions, projects, and project links
 * - Auto-save on value change
 * - Validation before save
 * - Error handling and display
 */
export function useInlineEdit(adminId: string) {
  const [state, setState] = useState<InlineEditState>({
    isEditing: false,
    field: null,
    progressId: null,
    originalValue: null,
    currentValue: null,
    error: null,
    isSaving: false,
  });

  const updateProgress = useUpdateProgress();
  const validateRef = useRef<ValidateFn>(defaultValidate);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear auto-save timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Start editing a field
   */
  const startEdit = useCallback(
    (
      progressId: string,
      field: InlineEditField,
      currentValue: number | string[],
      validate?: ValidateFn
    ) => {
      setState({
        isEditing: true,
        field,
        progressId,
        originalValue: currentValue,
        currentValue,
        error: null,
        isSaving: false,
      });
      validateRef.current = validate || defaultValidate;
    },
    []
  );

  /**
   * Cancel editing and restore original value
   */
  const cancelEdit = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    setState({
      isEditing: false,
      field: null,
      progressId: null,
      originalValue: null,
      currentValue: null,
      error: null,
      isSaving: false,
    });
    validateRef.current = defaultValidate;
  }, []);

  /**
   * Update the current value (triggers validation)
   */
  const updateValue = useCallback((newValue: number | string[]) => {
    setState((prev) => {
      const validation = validateRef.current(newValue);
      return {
        ...prev,
        currentValue: newValue,
        error: validation.isValid ? null : validation.error || 'Giá trị không hợp lệ',
      };
    });
  }, []);

  /**
   * Save the current value
   */
  const save = useCallback(async (): Promise<boolean> => {
    if (!state.progressId || !state.field || state.currentValue === null) {
      return false;
    }

    // Validate before save
    const validation = validateRef.current(state.currentValue);
    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        error: validation.error || 'Giá trị không hợp lệ',
      }));
      return false;
    }

    // Don't save if value hasn't changed
    if (JSON.stringify(state.currentValue) === JSON.stringify(state.originalValue)) {
      cancelEdit();
      return true;
    }

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      // Build update data based on field
      const updateData: UpdateProgressInput = {};
      
      switch (state.field) {
        case 'sessions':
          updateData.completedSessions = state.currentValue as number;
          break;
        case 'projects':
          updateData.projectsSubmitted = state.currentValue as number;
          break;
        case 'projectLinks':
          updateData.projectLinks = state.currentValue as string[];
          break;
      }

      const result = await updateProgress.mutateAsync({
        progressId: state.progressId,
        data: updateData,
        adminId,
      });

      if (result.success) {
        setState({
          isEditing: false,
          field: null,
          progressId: null,
          originalValue: null,
          currentValue: null,
          error: null,
          isSaving: false,
        });
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: result.error.message || 'Không thể lưu thay đổi',
        }));
        return false;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Không thể lưu thay đổi',
      }));
      return false;
    }
  }, [state.progressId, state.field, state.currentValue, state.originalValue, adminId, updateProgress, cancelEdit]);

  /**
   * Auto-save with debounce
   * Requirements: 2.3 - Auto-save on value change
   */
  const autoSave = useCallback(
    (newValue: number | string[], debounceMs: number = 500) => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Update value immediately
      updateValue(newValue);

      // Schedule save
      autoSaveTimeoutRef.current = setTimeout(() => {
        save();
      }, debounceMs);
    },
    [updateValue, save]
  );

  /**
   * Check if currently editing a specific field
   */
  const isEditingField = useCallback(
    (progressId: string, field: InlineEditField) => {
      return state.isEditing && state.progressId === progressId && state.field === field;
    },
    [state.isEditing, state.progressId, state.field]
  );

  return {
    // State
    state,
    isEditing: state.isEditing,
    isSaving: state.isSaving,
    error: state.error,
    currentValue: state.currentValue,

    // Actions
    startEdit,
    cancelEdit,
    updateValue,
    save,
    autoSave,

    // Helpers
    isEditingField,
  };
}

/**
 * Type for the return value of useInlineEdit
 */
export type UseInlineEditReturn = ReturnType<typeof useInlineEdit>;

/**
 * Validation helpers for inline edit
 */
export const inlineEditValidators = {
  /**
   * Create a session count validator
   * Requirements: 2.4
   */
  sessions: (requiredSessions: number): ValidateFn => (value) => {
    const sessions = value as number;
    if (sessions < 0) {
      return { isValid: false, error: 'Số buổi không được âm' };
    }
    if (sessions > requiredSessions) {
      return { isValid: false, error: `Số buổi không được vượt quá ${requiredSessions}` };
    }
    return { isValid: true };
  },

  /**
   * Create a project count validator
   * Requirements: 2.5
   */
  projects: (requiredProjects: number): ValidateFn => (value) => {
    const projects = value as number;
    if (projects < 0) {
      return { isValid: false, error: 'Số dự án không được âm' };
    }
    if (projects > requiredProjects) {
      return { isValid: false, error: `Số dự án không được vượt quá ${requiredProjects}` };
    }
    return { isValid: true };
  },

  /**
   * Create a project links validator
   * Requirements: 2.6
   */
  projectLinks: (): ValidateFn => (value) => {
    const links = value as string[];
    for (const link of links) {
      try {
        const url = new URL(link);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return { isValid: false, error: 'Link dự án phải sử dụng giao thức http hoặc https' };
        }
      } catch {
        return { isValid: false, error: `Link không hợp lệ: ${link}` };
      }
    }
    return { isValid: true };
  },
};
