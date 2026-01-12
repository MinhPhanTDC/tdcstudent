'use client';

import { useReducer, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ImportResult, ValidatedImportRow, ImportStatus, ImportProgress } from '@tdc/schemas';
import { parseImportFile, type ParseResult } from '@/lib/import/parser';
import { validateImportRows, type ValidationResult } from '@/lib/import/validator';
import {
  importStudents,
  createImportController,
  type ImportController,
} from '@/lib/import/importer';
import { studentKeys } from './useStudents';

/**
 * Import state interface
 * Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.8
 */
export interface ImportState {
  status: ImportStatus;
  file: File | null;
  parseResult: ParseResult | null;
  validationResult: ValidationResult | null;
  progress: ImportProgress;
  result: ImportResult | null;
  error: string | null;
}

/**
 * Import action types
 */
type ImportAction =
  | { type: 'SET_FILE'; payload: File }
  | { type: 'START_PARSING' }
  | { type: 'PARSE_SUCCESS'; payload: ParseResult }
  | { type: 'PARSE_ERROR'; payload: string }
  | { type: 'START_VALIDATING' }
  | { type: 'VALIDATION_SUCCESS'; payload: ValidationResult }
  | { type: 'START_IMPORTING' }
  | { type: 'UPDATE_PROGRESS'; payload: ImportProgress }
  | { type: 'IMPORT_SUCCESS'; payload: ImportResult }
  | { type: 'IMPORT_ERROR'; payload: string }
  | { type: 'IMPORT_CANCELLED' }
  | { type: 'RESET' };

/**
 * Initial state
 */
const initialState: ImportState = {
  status: 'idle',
  file: null,
  parseResult: null,
  validationResult: null,
  progress: { current: 0, total: 0 },
  result: null,
  error: null,
};

/**
 * Import reducer
 */
function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'SET_FILE':
      return {
        ...initialState,
        file: action.payload,
      };

    case 'START_PARSING':
      return {
        ...state,
        status: 'parsing',
        error: null,
      };

    case 'PARSE_SUCCESS':
      return {
        ...state,
        status: 'validating',
        parseResult: action.payload,
      };

    case 'PARSE_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };

    case 'START_VALIDATING':
      return {
        ...state,
        status: 'validating',
      };

    case 'VALIDATION_SUCCESS':
      return {
        ...state,
        status: 'previewing',
        validationResult: action.payload,
      };

    case 'START_IMPORTING':
      return {
        ...state,
        status: 'importing',
        progress: { current: 0, total: state.validationResult?.validCount || 0 },
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };

    case 'IMPORT_SUCCESS':
      return {
        ...state,
        status: 'complete',
        result: action.payload,
      };

    case 'IMPORT_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };

    case 'IMPORT_CANCELLED':
      return {
        ...state,
        status: 'error',
        error: 'Import đã bị hủy',
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}


/**
 * Hook for managing student import workflow
 * Implements state machine with useReducer
 * Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.8
 */
export function useStudentImport() {
  const [state, dispatch] = useReducer(importReducer, initialState);
  const queryClient = useQueryClient();
  const controllerRef = useRef<ImportController | null>(null);

  /**
   * Set file and start parsing
   */
  const setFile = useCallback(async (file: File) => {
    dispatch({ type: 'SET_FILE', payload: file });
    dispatch({ type: 'START_PARSING' });

    try {
      const parseResult = await parseImportFile(file);

      if (parseResult.errors.length > 0 && parseResult.rows.length === 0) {
        dispatch({ type: 'PARSE_ERROR', payload: parseResult.errors.join(', ') });
        return;
      }

      dispatch({ type: 'PARSE_SUCCESS', payload: parseResult });

      // Auto-validate after parsing
      const validationResult = validateImportRows(parseResult.rows);
      dispatch({ type: 'VALIDATION_SUCCESS', payload: validationResult });
    } catch (error) {
      dispatch({
        type: 'PARSE_ERROR',
        payload: error instanceof Error ? error.message : 'Lỗi không xác định khi đọc file',
      });
    }
  }, []);

  /**
   * Re-validate rows (if needed)
   */
  const revalidate = useCallback(() => {
    if (!state.parseResult) return;

    dispatch({ type: 'START_VALIDATING' });
    const validationResult = validateImportRows(state.parseResult.rows);
    dispatch({ type: 'VALIDATION_SUCCESS', payload: validationResult });
  }, [state.parseResult]);

  /**
   * Execute import for valid rows
   */
  const executeImport = useCallback(async () => {
    if (!state.validationResult) return;

    dispatch({ type: 'START_IMPORTING' });

    // Create controller for cancellation
    controllerRef.current = createImportController();

    try {
      const result = await importStudents(
        state.validationResult,
        { rateLimit: 10, skipDuplicates: true },
        {
          onProgress: (current, total) => {
            dispatch({ type: 'UPDATE_PROGRESS', payload: { current, total } });
          },
          onCancelled: () => {
            dispatch({ type: 'IMPORT_CANCELLED' });
          },
        },
        controllerRef.current
      );

      dispatch({ type: 'IMPORT_SUCCESS', payload: result });

      // Invalidate student queries to refresh lists
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    } catch (error) {
      dispatch({
        type: 'IMPORT_ERROR',
        payload: error instanceof Error ? error.message : 'Lỗi không xác định khi import',
      });
    }
  }, [state.validationResult, queryClient]);

  /**
   * Cancel ongoing import
   */
  const cancelImport = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.cancel();
    }
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    controllerRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  /**
   * Get valid rows for preview
   */
  const getValidRows = useCallback((): ValidatedImportRow[] => {
    return state.validationResult?.validatedRows.filter((r) => r.isValid) || [];
  }, [state.validationResult]);

  /**
   * Get invalid rows for preview
   */
  const getInvalidRows = useCallback((): ValidatedImportRow[] => {
    return state.validationResult?.validatedRows.filter((r) => !r.isValid) || [];
  }, [state.validationResult]);

  /**
   * Check if can proceed to import
   */
  const canImport = state.status === 'previewing' && (state.validationResult?.validCount || 0) > 0;

  /**
   * Check if import is in progress
   */
  const isImporting = state.status === 'importing';

  /**
   * Get progress percentage
   */
  const progressPercent =
    state.progress.total > 0 ? Math.round((state.progress.current / state.progress.total) * 100) : 0;

  return {
    // State
    state,
    status: state.status,
    file: state.file,
    parseResult: state.parseResult,
    validationResult: state.validationResult,
    progress: state.progress,
    result: state.result,
    error: state.error,

    // Computed
    canImport,
    isImporting,
    progressPercent,

    // Actions
    setFile,
    revalidate,
    executeImport,
    cancelImport,
    reset,

    // Helpers
    getValidRows,
    getInvalidRows,
  };
}

/**
 * Export action type for external use
 */
export type { ImportAction };
