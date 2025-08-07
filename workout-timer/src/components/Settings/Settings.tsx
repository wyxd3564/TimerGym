// Settings Component - 설정 화면 컴포넌트
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../Button/Button';
import { AUDIO_CONSTANTS } from '../../types';
import { classNames } from '../../utils';
import { useScreenReader } from '../../hooks/useScreenReader';
import styles from './Settings.module.css';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const {
    settings,
    updateSoundSettings,
    updateVibrationSettings,
    updateUISettings,
    resetSettings
  } = useSettings();
  
  // 스크린 리더 지원
  const { announceSettingChange } = useScreenReader();

  const handleSoundToggle = () => {
    const newValue = !settings.sound.enabled;
    updateSoundSettings({ enabled: newValue });
    announceSettingChange('소리 알림', newValue);
  };

  const handleVibrationToggle = () => {
    const newValue = !settings.vibration.enabled;
    updateVibrationSettings({ enabled: newValue });
    announceSettingChange('진동 알림', newValue);
  };

  const handleCountdownSoundChange = (sound: string) => {
    updateSoundSettings({ countdownSound: sound });
    announceSettingChange('카운트다운 알림음', sound);
  };

  const handleCompletionSoundChange = (sound: string) => {
    updateSoundSettings({ completionSound: sound });
    announceSettingChange('완료 알림음', sound);
  };

  const handleThemeToggle = () => {
    const newTheme = settings.ui.theme === 'light' ? 'dark' : 'light';
    updateUISettings({ theme: newTheme });
    announceSettingChange('테마', newTheme === 'dark' ? '다크 모드' : '라이트 모드');
    
    // 테마를 DOM에 즉시 적용
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleKeepScreenOnToggle = () => {
    const newValue = !settings.ui.keepScreenOn;
    updateUISettings({ keepScreenOn: newValue });
    announceSettingChange('화면 켜두기', newValue);
  };

  const handleReset = () => {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
      resetSettings();
      // 테마 초기화 시 DOM에도 적용
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return (
    <div className={styles.settingsContent}>
        {/* 알림 설정 */}
        <section className={styles.section} aria-labelledby="notification-settings">
          <h3 id="notification-settings" className={styles.sectionTitle}>알림 설정</h3>
          
          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>
              <span className={styles.labelText}>소리 알림</span>
              <button
                className={classNames(
                  styles.toggle,
                  settings.sound.enabled && styles.toggleActive
                )}
                onClick={handleSoundToggle}
                aria-label={`소리 알림 ${settings.sound.enabled ? '끄기' : '켜기'}`}
                aria-pressed={settings.sound.enabled}
                role="switch"
              >
                <span className={styles.toggleSlider} aria-hidden="true" />
              </button>
            </label>
          </div>

          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>
              <span className={styles.labelText}>진동 알림</span>
              <button
                className={classNames(
                  styles.toggle,
                  settings.vibration.enabled && styles.toggleActive
                )}
                onClick={handleVibrationToggle}
                aria-label={`진동 알림 ${settings.vibration.enabled ? '끄기' : '켜기'}`}
                aria-pressed={settings.vibration.enabled}
                role="switch"
              >
                <span className={styles.toggleSlider} aria-hidden="true" />
              </button>
            </label>
          </div>
        </section>

        {/* 알림음 선택 */}
        <section className={styles.section} aria-labelledby="sound-selection">
          <h3 id="sound-selection" className={styles.sectionTitle}>알림음 선택</h3>
          
          <div className={styles.settingItem}>
            <span className={styles.settingSubtitle} id="countdown-sound-label">카운트다운 알림음</span>
            <div className={styles.radioGroup} role="radiogroup" aria-labelledby="countdown-sound-label">
              {Object.values(AUDIO_CONSTANTS.SOUNDS).map((sound) => (
                <label key={`countdown-${sound}`} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="countdownSound"
                    value={sound}
                    checked={settings.sound.countdownSound === sound}
                    onChange={() => handleCountdownSoundChange(sound)}
                    className={styles.radioInput}
                    aria-describedby={`countdown-${sound}-desc`}
                  />
                  <span className={styles.radioText} id={`countdown-${sound}-desc`}>
                    {sound === 'beep' && '기본음 (띵)'}
                    {sound === 'bell' && '벨소리'}
                    {sound === 'chime' && '차임'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.settingItem}>
            <span className={styles.settingSubtitle} id="completion-sound-label">완료 알림음</span>
            <div className={styles.radioGroup} role="radiogroup" aria-labelledby="completion-sound-label">
              {Object.values(AUDIO_CONSTANTS.SOUNDS).map((sound) => (
                <label key={`completion-${sound}`} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="completionSound"
                    value={sound}
                    checked={settings.sound.completionSound === sound}
                    onChange={() => handleCompletionSoundChange(sound)}
                    className={styles.radioInput}
                    aria-describedby={`completion-${sound}-desc`}
                  />
                  <span className={styles.radioText} id={`completion-${sound}-desc`}>
                    {sound === 'beep' && '기본음 (띵)'}
                    {sound === 'bell' && '벨소리'}
                    {sound === 'chime' && '차임'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 화면 설정 */}
        <section className={styles.section} aria-labelledby="ui-settings">
          <h3 id="ui-settings" className={styles.sectionTitle}>화면 설정</h3>
          
          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>
              <span className={styles.labelText}>다크 모드</span>
              <button
                className={classNames(
                  styles.toggle,
                  settings.ui.theme === 'dark' && styles.toggleActive
                )}
                onClick={handleThemeToggle}
                aria-label={`다크 모드 ${settings.ui.theme === 'dark' ? '끄기' : '켜기'}`}
                aria-pressed={settings.ui.theme === 'dark'}
                role="switch"
              >
                <span className={styles.toggleSlider} aria-hidden="true" />
              </button>
            </label>
          </div>

          <div className={styles.settingItem}>
            <label className={styles.settingLabel}>
              <span className={styles.labelText}>화면 켜두기</span>
              <button
                className={classNames(
                  styles.toggle,
                  settings.ui.keepScreenOn && styles.toggleActive
                )}
                onClick={handleKeepScreenOnToggle}
                aria-label={`화면 켜두기 ${settings.ui.keepScreenOn ? '끄기' : '켜기'}`}
                aria-pressed={settings.ui.keepScreenOn}
                role="switch"
              >
                <span className={styles.toggleSlider} aria-hidden="true" />
              </button>
            </label>
          </div>
        </section>

        {/* 액션 버튼 */}
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={handleReset}
            className={styles.resetButton}
          >
            설정 초기화
          </Button>
          <Button
            variant="primary"
            onClick={onClose}
            className={styles.closeButton}
          >
            완료
          </Button>
        </div>
      </div>
  );
};

export default Settings;