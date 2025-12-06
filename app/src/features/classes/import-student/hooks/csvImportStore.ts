import { useReducer } from 'react';
import type { ImportState, ImportAction } from '../../class-student/types';

const initialState: ImportState = {
  status: 'idle',
};

function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'FILE_SELECT':
      if (action.payload.errors.length > 0) {
        return {
          ...state,
          status: 'error',
          fileInfo: action.payload.fileInfo,
          parseResult: {
            success: false,
            data: [],
            totalRows: 0,
            previewRows: [],
            errors: action.payload.errors,
            warnings: [],
          },
          error: 'Invalid file',
        };
      }
      return {
        ...state,
        status: 'parsing',
        fileInfo: action.payload.fileInfo,
      };
    case 'PARSE_SUCCESS':
      return {
        ...state,
        status: 'preview',
        parseResult: action.payload,
      };
    case 'PARSE_ERROR':
      return {
        ...state,
        status: 'error',
        parseResult: action.payload,
        error: 'Failed to parse CSV',
      };
    case 'SUBMIT':
      return {
        ...state,
        status: 'submitting',
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        status: 'success',
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useCsvImportStore() {
  return useReducer(importReducer, initialState);
}

export default useCsvImportStore;
