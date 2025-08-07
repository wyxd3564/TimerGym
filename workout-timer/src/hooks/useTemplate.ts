// useTemplate Hook - TemplateContext를 사용하기 위한 커스텀 훅
import { useContext } from 'react';
import { TemplateContext } from '../contexts/TemplateContext';

export function useTemplate() {
  const context = useContext(TemplateContext);
  
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  
  return context;
}