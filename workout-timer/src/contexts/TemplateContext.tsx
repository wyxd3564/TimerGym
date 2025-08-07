// Template Context - 템플릿 CRUD 작업을 위한 Context
import { createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Template, TemplateState, TemplateAction } from '../types';
import { DEFAULT_TEMPLATES, DEFAULT_TEMPLATE_IDS } from '../types';
import { StorageService } from '../services/StorageService';
import { generateId } from '../utils';
import { useScreenReader } from '../hooks/useScreenReader';

interface TemplateContextType {
  state: TemplateState;
  dispatch: React.Dispatch<TemplateAction>;
  addTemplate: (name: string, duration: number) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (template: Template) => void;
}

export const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// 기본 템플릿을 ID와 함께 생성
const createDefaultTemplates = (): Template[] => {
  const defaultIds = [
    DEFAULT_TEMPLATE_IDS.THIRTY_SECONDS,
    DEFAULT_TEMPLATE_IDS.ONE_MINUTE,
    DEFAULT_TEMPLATE_IDS.THREE_MINUTES
  ];

  return DEFAULT_TEMPLATES.map((template, index) => ({
    ...template,
    id: defaultIds[index],
    createdAt: new Date()
  }));
};

const initialState: TemplateState = {
  templates: createDefaultTemplates(),
  isLoading: false,
  error: null
};

function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'LOAD_TEMPLATES':
      return {
        ...state,
        isLoading: false,
        error: null
      };

    case 'SET_TEMPLATES':
      return {
        ...state,
        templates: action.payload.templates,
        isLoading: false,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      };

    case 'ADD_TEMPLATE': {
      const newTemplate: Template = {
        ...action.payload.template,
        id: generateId(),
        createdAt: new Date()
      };
      
      const newTemplates = [...state.templates, newTemplate];
      
      // 커스텀 템플릿만 저장 (기본 템플릿 제외)
      const customTemplates = newTemplates.filter(t => !t.isDefault);
      StorageService.saveTemplates(customTemplates);
      
      return {
        ...state,
        templates: newTemplates,
        error: null
      };
    }

    case 'UPDATE_TEMPLATE': {
      const { id, updates } = action.payload;
      
      // 기본 템플릿은 수정 불가
      const template = state.templates.find(t => t.id === id);
      if (template?.isDefault) {
        return {
          ...state,
          error: '기본 템플릿은 수정할 수 없습니다.'
        };
      }
      
      const newTemplates = state.templates.map(template =>
        template.id === id ? { ...template, ...updates } : template
      );
      
      // 커스텀 템플릿만 저장
      const customTemplates = newTemplates.filter(t => !t.isDefault);
      StorageService.saveTemplates(customTemplates);
      
      return {
        ...state,
        templates: newTemplates,
        error: null
      };
    }

    case 'DELETE_TEMPLATE': {
      const { id } = action.payload;
      
      // 기본 템플릿은 삭제 불가
      const template = state.templates.find(t => t.id === id);
      if (template?.isDefault) {
        return {
          ...state,
          error: '기본 템플릿은 삭제할 수 없습니다.'
        };
      }
      
      const newTemplates = state.templates.filter(template => template.id !== id);
      
      // 커스텀 템플릿만 저장
      const customTemplates = newTemplates.filter(t => !t.isDefault);
      StorageService.saveTemplates(customTemplates);
      
      return {
        ...state,
        templates: newTemplates,
        error: null
      };
    }

    default:
      return state;
  }
}

interface TemplateProviderProps {
  children: ReactNode;
  onTemplateSelect?: (template: Template) => void;
}

export function TemplateProvider({ children, onTemplateSelect }: TemplateProviderProps) {
  const [state, dispatch] = useReducer(templateReducer, initialState);
  
  // 스크린 리더 지원
  const { announceTemplateSelection } = useScreenReader();

  // 초기 템플릿 로드
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
        
        const savedCustomTemplates = StorageService.loadTemplates();
        const defaultTemplates = createDefaultTemplates();
        
        // 기본 템플릿과 저장된 커스텀 템플릿 결합
        const allTemplates = [...defaultTemplates, ...savedCustomTemplates];
        
        // 템플릿 목록 설정
        dispatch({ 
          type: 'SET_TEMPLATES', 
          payload: { templates: allTemplates } 
        });
        
        console.log('Templates loaded:', allTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: { error: '템플릿을 불러오는데 실패했습니다.' } 
        });
      }
    };

    loadTemplates();
  }, []);

  // 템플릿 추가 (메모화)
  const addTemplate = useCallback((name: string, duration: number) => {
    if (!name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: { error: '템플릿 이름을 입력해주세요.' } });
      return;
    }
    
    if (duration <= 0) {
      dispatch({ type: 'SET_ERROR', payload: { error: '시간은 0보다 커야 합니다.' } });
      return;
    }
    
    // 중복 이름 체크
    const isDuplicate = state.templates.some(t => t.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      dispatch({ type: 'SET_ERROR', payload: { error: '이미 존재하는 템플릿 이름입니다.' } });
      return;
    }
    
    dispatch({
      type: 'ADD_TEMPLATE',
      payload: {
        template: {
          name: name.trim(),
          duration,
          isDefault: false
        }
      }
    });
  }, [state.templates]);

  // 템플릿 수정 (메모화)
  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    // 이름 중복 체크 (수정하는 템플릿 제외)
    if (updates.name) {
      const isDuplicate = state.templates.some(t => 
        t.id !== id && t.name.toLowerCase() === updates.name!.toLowerCase()
      );
      if (isDuplicate) {
        dispatch({ type: 'SET_ERROR', payload: { error: '이미 존재하는 템플릿 이름입니다.' } });
        return;
      }
    }
    
    dispatch({
      type: 'UPDATE_TEMPLATE',
      payload: { id, updates }
    });
  }, [state.templates]);

  // 템플릿 삭제 (메모화)
  const deleteTemplate = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_TEMPLATE',
      payload: { id }
    });
  }, []);

  // 템플릿 선택 (타이머에 적용) (메모화)
  const selectTemplate = useCallback((template: Template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    
    // 스크린 리더 알림
    announceTemplateSelection(template.name, template.duration);
  }, [onTemplateSelect, announceTemplateSelection]);

  const contextValue: TemplateContextType = useMemo(() => ({
    state,
    dispatch,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate
  }), [state, dispatch, addTemplate, updateTemplate, deleteTemplate, selectTemplate]);

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
}