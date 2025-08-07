// TemplateForm Component - 템플릿 추가/편집 폼
import React, { useState, useEffect } from 'react';
import { useTemplate } from '../../hooks/useTemplate';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import DragTimeInput from '../DragTimeInput/DragTimeInput';
import { splitTime, combineTime, validateTemplateForm } from '../../utils';
import type { Template } from '../../types';
import styles from './TemplateForm.module.css';

interface TemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  template?: Template | null; // null이면 새 템플릿 추가, Template이면 편집
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const { addTemplate, updateTemplate } = useTemplate();
  const [formData, setFormData] = useState({
    name: '',
    minutes: 1,
    seconds: 30
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = template !== null && template !== undefined;

  // 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      if (isEditing && template) {
        const { minutes, seconds } = splitTime(template.duration);
        setFormData({
          name: template.name,
          minutes,
          seconds
        });
      } else {
        setFormData({
          name: '',
          minutes: 1,
          seconds: 30
        });
      }
      setErrors([]);
      setIsSubmitting(false);
    }
  }, [isOpen, isEditing, template]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: event.target.value
    }));
    // 에러 클리어
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleMinutesChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      minutes: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSecondsChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      seconds: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors([]);

    // 폼 유효성 검사
    const validation = validateTemplateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const duration = combineTime(formData.minutes, formData.seconds);
      
      if (isEditing && template) {
        // 템플릿 수정
        updateTemplate(template.id, {
          name: formData.name.trim(),
          duration
        });
      } else {
        // 새 템플릿 추가
        addTemplate(formData.name.trim(), duration);
      }
      
      onClose();
    } catch (error) {
      console.error('Template form submission error:', error);
      setErrors(['템플릿 저장 중 오류가 발생했습니다.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '템플릿 편집' : '새 템플릿 추가'}
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.length > 0 && (
          <div className={styles.errorContainer} role="alert">
            {errors.map((error, index) => (
              <div key={index} className={styles.error}>
                {error}
              </div>
            ))}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="template-name" className={styles.label}>
            템플릿 이름
          </label>
          <input
            id="template-name"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className={styles.input}
            placeholder="예: 내 운동"
            disabled={isSubmitting}
            maxLength={50}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>시간 설정</label>
          <div className={styles.timeInputs}>
            <div className={styles.timeInputGroup}>
              <DragTimeInput
                value={formData.minutes}
                min={0}
                max={59}
                step={1}
                onChange={handleMinutesChange}
                label="분"
                disabled={isSubmitting}
                className={styles.timeInput}
              />
              <span className={styles.timeLabel}>분</span>
            </div>
            
            <div className={styles.timeSeparator}>:</div>
            
            <div className={styles.timeInputGroup}>
              <DragTimeInput
                value={formData.seconds}
                min={0}
                max={59}
                step={1}
                onChange={handleSecondsChange}
                label="초"
                disabled={isSubmitting}
                className={styles.timeInput}
              />
              <span className={styles.timeLabel}>초</span>
            </div>
          </div>
          
          <div className={styles.timeHint}>
            위아래로 드래그하거나 +/- 버튼으로 조정하세요
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? '저장 중...' : (isEditing ? '수정' : '저장')}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            취소
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TemplateForm;