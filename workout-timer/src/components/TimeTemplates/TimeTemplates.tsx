// TimeTemplates Component - 템플릿 선택 인터페이스
import React, { useState } from 'react';
import { useTemplate } from '../../hooks/useTemplate';
import { useTimer } from '../../hooks/useTimer';
import TemplateForm from '../TemplateForm/TemplateForm';
import Button from '../Button/Button';
import { formatTime } from '../../utils';
import type { Template } from '../../types';
import styles from './TimeTemplates.module.css';

interface TimeTemplatesProps {
  onClose: () => void;
}

const TimeTemplates: React.FC<TimeTemplatesProps> = ({ onClose }) => {
  const { state, deleteTemplate, selectTemplate } = useTemplate();
  const { setDuration } = useTimer();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleTemplateSelect = (template: Template) => {
    setDuration(template.duration);
    selectTemplate(template);
    onClose();
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDeleteTemplate = (template: Template) => {
    if (window.confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
      deleteTemplate(template.id);
    }
  };

  const handleAddNewTemplate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const { templates, error } = state;

  return (
    <>
      <div className={styles.container}>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.templateList}>
          {templates.map((template) => (
            <div key={template.id} className={styles.templateItem}>
              <button
                className={styles.templateButton}
                onClick={() => handleTemplateSelect(template)}
                aria-label={`${template.name} 템플릿 선택 (${formatTime(template.duration)})`}
              >
                <div className={styles.templateName}>{template.name}</div>
                <div className={styles.templateDuration}>
                  {formatTime(template.duration)}
                </div>
              </button>

              {!template.isDefault && (
                <div className={styles.templateActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditTemplate(template)}
                    aria-label={`${template.name} 템플릿 편집`}
                    title="편집"
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDeleteTemplate(template)}
                    aria-label={`${template.name} 템플릿 삭제`}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleAddNewTemplate}
            className={styles.addButton}
          >
            + 새 템플릿 추가
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
            className={styles.closeButton}
          >
            닫기
          </Button>
        </div>
      </div>

      {/* 템플릿 추가/편집 폼 */}
      <TemplateForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        template={editingTemplate}
      />
    </>
  );
};

export default TimeTemplates;