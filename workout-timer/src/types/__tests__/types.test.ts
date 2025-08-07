import { describe, it, expect } from 'vitest';
import type {
  TimerState,
  SettingsState,
  Template,
  TemplateState,
  TimerAction,
  TemplateAction,
  TimerStatus,
  SoundType,
  VibrationPattern,
  StorageKey
} from '../index';
import {
  DEFAULT_TEMPLATES,
  DEFAULT_SETTINGS,
  TIMER_STATES,
  TIME_CONSTANTS,
  AUDIO_CONSTANTS,
  VIBRATION_PATTERNS,
  UI_CONSTANTS,
  STORAGE_KEYS,
  DEFAULT_TEMPLATE_IDS
} from '../index';

describe('Type Definitions', () => {
  it('should have correct default templates', () => {
    expect(DEFAULT_TEMPLATES).toHaveLength(3);
    expect(DEFAULT_TEMPLATES[0]).toEqual({
      name: '30초',
      duration: 30,
      isDefault: true
    });
    expect(DEFAULT_TEMPLATES[1]).toEqual({
      name: '1분',
      duration: 60,
      isDefault: true
    });
    expect(DEFAULT_TEMPLATES[2]).toEqual({
      name: '3분',
      duration: 180,
      isDefault: true
    });
  });

  it('should have correct default settings', () => {
    expect(DEFAULT_SETTINGS.sound.enabled).toBe(true);
    expect(DEFAULT_SETTINGS.sound.countdownSound).toBe('beep');
    expect(DEFAULT_SETTINGS.sound.completionSound).toBe('bell');
    expect(DEFAULT_SETTINGS.vibration.enabled).toBe(true);
    expect(DEFAULT_SETTINGS.ui.theme).toBe('light');
    expect(DEFAULT_SETTINGS.ui.keepScreenOn).toBe(false);
  });

  it('should have correct timer states', () => {
    expect(TIMER_STATES.IDLE).toBe('idle');
    expect(TIMER_STATES.RUNNING).toBe('running');
    expect(TIMER_STATES.PAUSED).toBe('paused');
    expect(TIMER_STATES.COMPLETED).toBe('completed');
  });

  it('should have correct time constants', () => {
    expect(TIME_CONSTANTS.MIN_SECONDS).toBe(1);
    expect(TIME_CONSTANTS.MAX_SECONDS).toBe(3599);
    expect(TIME_CONSTANTS.COUNTDOWN_THRESHOLD).toBe(3);
    expect(TIME_CONSTANTS.WARNING_THRESHOLD).toBe(10);
    expect(TIME_CONSTANTS.DANGER_THRESHOLD).toBe(30);
  });

  it('should have correct audio constants', () => {
    expect(AUDIO_CONSTANTS.SOUNDS.BEEP).toBe('beep');
    expect(AUDIO_CONSTANTS.SOUNDS.BELL).toBe('bell');
    expect(AUDIO_CONSTANTS.SOUNDS.CHIME).toBe('chime');
    expect(AUDIO_CONSTANTS.DEFAULT_VOLUME).toBe(0.8);
  });

  it('should have correct vibration patterns', () => {
    expect(VIBRATION_PATTERNS.COUNTDOWN).toEqual([100]);
    expect(VIBRATION_PATTERNS.COMPLETION).toEqual([200, 100, 200, 100, 200]);
  });

  it('should have correct UI constants', () => {
    expect(UI_CONSTANTS.DRAG_SENSITIVITY).toBe(2);
    expect(UI_CONSTANTS.TOUCH_TARGET_SIZE).toBe(44);
  });

  it('should have correct storage keys', () => {
    expect(STORAGE_KEYS.SETTINGS).toBe('workout-timer-settings');
    expect(STORAGE_KEYS.TEMPLATES).toBe('workout-timer-templates');
    expect(STORAGE_KEYS.THEME).toBe('workout-timer-theme');
    expect(STORAGE_KEYS.TIMER_STATE).toBe('workout-timer-state');
  });

  it('should have correct default template IDs', () => {
    expect(DEFAULT_TEMPLATE_IDS.THIRTY_SECONDS).toBe('default-30s');
    expect(DEFAULT_TEMPLATE_IDS.ONE_MINUTE).toBe('default-1m');
    expect(DEFAULT_TEMPLATE_IDS.THREE_MINUTES).toBe('default-3m');
  });
});

describe('Type Compatibility', () => {
  it('should create valid timer state', () => {
    const timerState: TimerState = {
      duration: 60,
      remainingTime: 30,
      repetitions: 5,
      isRunning: true,
      isPaused: false
    };
    
    expect(timerState.duration).toBe(60);
    expect(timerState.remainingTime).toBe(30);
    expect(timerState.repetitions).toBe(5);
    expect(timerState.isRunning).toBe(true);
    expect(timerState.isPaused).toBe(false);
  });

  it('should create valid template', () => {
    const template: Template = {
      id: 'test-id',
      name: 'Test Template',
      duration: 120,
      isDefault: false,
      createdAt: new Date()
    };
    
    expect(template.id).toBe('test-id');
    expect(template.name).toBe('Test Template');
    expect(template.duration).toBe(120);
    expect(template.isDefault).toBe(false);
    expect(template.createdAt).toBeInstanceOf(Date);
  });

  it('should create valid timer actions', () => {
    const startAction: TimerAction = { type: 'START_TIMER' };
    const setDurationAction: TimerAction = { 
      type: 'SET_DURATION', 
      payload: { duration: 60 } 
    };
    
    expect(startAction.type).toBe('START_TIMER');
    expect(setDurationAction.type).toBe('SET_DURATION');
    expect(setDurationAction.payload?.duration).toBe(60);
  });
});