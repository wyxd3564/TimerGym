# 구현 계획

- [x] 1. 프로젝트 초기 설정 및 기본 구조 생성








  - React + TypeScript + Vite 프로젝트 생성
  - 기본 폴더 구조 설정 (components, contexts, services, types, utils)
  - CSS Modules 설정 및 기본 스타일 변수 정의
  - _Requirements: NFR-3_

- [x] 2. 핵심 타입 정의 및 상수 설정





  - 타이머 상태, 설정, 템플릿 관련 TypeScript 인터페이스 정의
  - 기본 템플릿 상수 및 시간 관련 유틸리티 함수 작성
  - _Requirements: 1.1, 4.1_

- [x] 3. 타이머 핵심 로직 구현





- [x] 3.1 Timer 서비스 클래스 구현


  - setInterval 기반 타이머 로직 작성
  - 시작, 일시정지, 리셋, 틱 콜백 기능 구현
  - 단위 테스트 작성
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 3.2 TimerContext 및 상태 관리 구현


  - useReducer를 사용한 타이머 상태 관리
  - 타이머 액션 디스패처 구현
  - Context Provider 컴포넌트 작성
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 4. 원형 진행률 표시기 구현






- [x] 4.1 CircularProgress 컴포넌트 생성

  - SVG 기반 원형 진행률 바 구현
  - 진행률에 따른 애니메이션 효과 추가
  - 색상 변화 로직 구현 (마지막 10초 동안)
  - _Requirements: 1.2_

- [x] 4.2 TimerDisplay 컴포넌트 구현


  - 시간 표시 (MM:SS 형식) 구현
  - 반복 횟수 표시 기능 추가
  - CircularProgress와 통합
  - _Requirements: 1.1, 2.1_
-

- [x] 5. 타이머 컨트롤 기능 구현




- [x] 5.1 TimerControls 컴포넌트 생성


  - 시작/정지/초기화 버튼 구현
  - 반복 횟수 증가/감소 버튼 구현
  - 버튼 상태 관리 (활성화/비활성화)
  - _Requirements: 1.3, 1.4, 1.5, 2.2, 2.3, 2.4_

- [x] 5.2 시간 설정 기능 구현


  - 시간 표시 클릭 시 설정 모드 전환
  - 분/초 개별 조정 인터페이스 구현
  - 설정 확인/취소 기능 추가
  - _Requirements: 1.1_

- [x] 6. 알림 시스템 구현





- [x] 6.1 AudioNotificationService 구현


  - Web Audio API를 사용한 오디오 재생 기능
  - 카운트다운 알림음 (3, 2, 1초) 구현
  - 완료 알림음 재생 기능
  - 프로그래밍 방식으로 beep, bell, chime 사운드 생성
  - 볼륨 제어 및 사용자 상호작용 후 초기화 지원
  - _Requirements: 3.1, 3.2_

- [x] 6.2 VibrationService 구현


  - Vibration API를 사용한 진동 기능
  - 카운트다운 및 완료 시 진동 패턴 구현
  - 브라우저 지원 여부 확인 로직
  - _Requirements: 3.2_

- [x] 6.3 알림 통합 및 설정 연동


  - 타이머와 알림 서비스 연동
  - 설정에 따른 알림 활성화/비활성화
  - 알림 테스트 기능 구현
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 7. 헤더 및 네비게이션 구현







- [x] 7.1 Header 컴포넌트 생성




  - 좌측 템플릿 버튼, 중앙 제목, 우측 설정 버튼 레이아웃
  - 버튼 클릭 시 모달 열기 기능
  - 반응형 디자인 적용
  - _Requirements: 4.2_

- [x] 8. 템플릿 시스템 구현









- [x] 8.1 TemplateContext 및 상태 관리 구현


  - 템플릿 CRUD 작업을 위한 Context 생성
  - localStorage를 사용한 템플릿 영구 저장
  - 기본 템플릿 초기화 로직
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [x] 8.2 TimeTemplates 컴포넌트 구현


  - 템플릿 선택 모달 인터페이스 구현
  - 기본 템플릿과 커스텀 템플릿 구분 표시
  - 템플릿 선택 시 타이머 설정 기능
  - 커스텀 템플릿 편집/삭제 버튼 추가
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 9. 드래그 시간 입력 구현





- [x] 9.1 DragTimeInput 컴포넌트 생성


  - 마우스 및 터치 드래그 이벤트 처리
  - 드래그 방향에 따른 값 증가/감소 로직
  - 드래그 민감도 및 범위 제한 구현
  - _Requirements: 4.3_

- [x] 9.2 TemplateForm 컴포넌트 구현


  - 템플릿 이름 입력 필드 구현
  - DragTimeInput을 사용한 시간 설정 인터페이스
  - 기존 +/- 버튼과 드래그 기능 통합
  - 폼 유효성 검사 및 저장/취소 기능
  - _Requirements: 4.3, 4.4_

- [x] 10. 설정 시스템 구현






- [x] 10.1 SettingsContext 및 상태 관리 구현


  - 설정 상태 관리를 위한 Context 생성
  - localStorage를 사용한 설정 영구 저장
  - 기본 설정값 정의 및 초기화
  - _Requirements: 3.3_

- [x] 10.2 Settings 컴포넌트 구현




  - 알림 설정 (소리/진동) 토글 스위치
  - 알림음 선택 라디오 버튼
  - 다크/라이트 모드 설정
  - 화면 켜두기 설정 옵션
  - _Requirements: 3.3_

- [x] 11. PWA 기능 구현





- [x] 11.1 Service Worker 설정


  - Workbox를 사용한 Service Worker 구성
  - 백그라운드 타이머 상태 동기화 로직
  - 오프라인 지원 및 캐싱 전략
  - _Requirements: NFR-1_

- [x] 11.2 백그라운드 실행 지원


  - IndexedDB를 사용한 타이머 상태 저장
  - 포그라운드 복귀 시 상태 복원 로직
  - Wake Lock API 통합 (선택적)
  - _Requirements: NFR-1_

- [x] 12. 스타일링 및 반응형 디자인





- [x] 12.1 CSS Modules 스타일 구현


  - 각 컴포넌트별 스타일 모듈 작성
  - 다크/라이트 테마 CSS 변수 정의
  - 애니메이션 및 트랜지션 효과 추가
  - _Requirements: NFR-2_

- [x] 12.2 반응형 및 모바일 최적화


  - 모바일 우선 반응형 디자인 구현
  - 터치 타겟 크기 최적화 (최소 44px)
  - 가로/세로 모드 대응
  - _Requirements: NFR-3_

- [x] 13. 접근성 구현





- [x] 13.1 키보드 네비게이션 지원


  - 모든 인터랙티브 요소에 적절한 tabindex 설정
  - 키보드 단축키 구현 (스페이스바로 시작/정지)
  - 포커스 표시 스타일 추가
  - _Requirements: NFR-2_

- [x] 13.2 스크린 리더 지원


  - ARIA 레이블 및 역할 정의
  - 타이머 상태 변경 시 live region 업데이트
  - 진행률 정보를 텍스트로 제공
  - _Requirements: NFR-2_

- [x] 14. 테스트 구현







- [x] 14.1 단위 테스트 작성




  - Timer 서비스 로직 테스트
  - 유틸리티 함수 테스트 (시간 포맷팅, 진행률 계산)
  - Context 및 Hook 테스트
  - _Requirements: 모든 핵심 기능_

- [x] 14.2 컴포넌트 테스트 작성


  - React Testing Library를 사용한 컴포넌트 테스트
  - 사용자 인터랙션 시나리오 테스트
  - 모달 및 폼 동작 테스트
  - _Requirements: 모든 UI 기능_

- [x] 15. 성능 최적화 및 마무리





- [x] 15.1 성능 최적화 적용


  - React.memo 및 useMemo/useCallback 최적화
  - 드래그 이벤트 throttling 구현
  - 번들 크기 최적화 및 코드 스플리팅
  - _Requirements: NFR-2_

- [x] 15.2 최종 통합 테스트 및 버그 수정






  - 전체 타이머 사이클 E2E 테스트
  - 백그라운드 동작 테스트
  - 크로스 브라우저 호환성 확인
  - _Requirements: 모든 요구사항_

- [x] 15.3 PWA 매니페스트 및 아이콘 설정


  - 앱 매니페스트 파일 작성
  - 다양한 크기의 앱 아이콘 생성
  - 스플래시 스크린 설정
  - _Requirements: NFR-3_

- [x] 16. 모드 선택 기능 구현









- [x] 16.1 ModeSelector 컴포넌트 생성




  - 타이머/스톱워치 모드 전환 버튼 구현
  - 현재 활성 모드 시각적 표시
  - 모드 전환 시 상태 초기화 로직
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [x] 16.2 TimerContext 모드 지원 확장




  - 타이머 상태에 mode 필드 추가
  - 스톱워치 모드용 elapsedTime 상태 추가
  - 모드별 타이머 로직 분기 처리
  - SET_MODE 액션 구현
  - _Requirements: 1.4, 1.5_

- [x] 16.3 TimerDisplay 모드별 동작 구현




  - 타이머 모드: 카운트다운 시간 표시, 진행률은 경과 시간에 따라 증가 (스톱워치와 동일한 UX)
  - 스톱워치 모드: 카운트업 및 진행률 증가
  - 모드에 따른 시간 표시 로직 변경
  - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 17. 음성 카운트 기능 구현











- [x] 17.1 VoiceCountService 클래스 구현




  - Web Audio API를 사용한 삐 소리 생성
  - SpeechSynthesis API를 사용한 한국어 음성 출력
  - 1초 간격 삐 소리 + 2초 후 음성 카운트 로직
  - 한국어 숫자 변환 함수 ("하나, 둘, 셋...")
  - _Requirements: 3.2, 3.3, 3.5_

- [x] 17.2 VoiceCountButton 컴포넌트 생성




  - 원형 타이머 중앙에 위치한 음성 버튼
  - 클릭 시 음성 카운트 시작/중지 토글
  - 활성 상태 시각적 표시 (아이콘 변경, 색상 변화)
  - 접근성 지원 (ARIA 레이블, 키보드 네비게이션)
  - _Requirements: 3.1, 3.4, 3.6_

- [x] 17.3 음성 카운트와 타이머 통합




  - TimerContext에 음성 카운트 상태 추가
  - TOGGLE_VOICE_COUNT, INCREMENT_VOICE_COUNT 액션 구현
  - 음성 카운트 활성화 시 서비스 시작/중지 연동
  - 타이머 리셋 시 음성 카운트도 함께 리셋
  - _Requirements: 3.1, 3.4, 3.5_

- [x] 18. UI 레이아웃 업데이트









- [x] 18.1 ModeSelector를 Header에서 분리하여 독립 배치




  - Header에서 ModeSelector 제거
  - App.tsx에서 Header 아래 별도 섹션으로 배치
  - 모드 선택 버튼 크기를 1.5배로 확대
  - 반응형 디자인 적용
  - _Requirements: 1.1_

- [x] 18.2 TimerDisplay에 VoiceCountButton 통합




  - 원형 진행률 바 중앙에 음성 버튼 배치
  - 반복 횟수와 음성 버튼의 레이아웃 조정
  - 버튼 크기 및 위치 최적화
  - _Requirements: 3.1_

- [ ] 19. 스타일링 및 애니메이션 추가









- [x] 19.1 모드 선택 버튼 스타일링




  - 활성/비활성 상태 시각적 구분
  - 호버 및 포커스 상태 스타일
  - 부드러운 전환 애니메이션
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 19.2 음성 버튼 스타일링 및 애니메이션




  - 기본/활성 상태 아이콘 및 색상
  - 클릭 시 피드백 애니메이션
  - 음성 카운트 활성 시 펄스 효과
  - _Requirements: 3.4, 3.6_

- [x] 20. 테스트 추가









- [x] 20.1 모드 선택 기능 테스트




  - ModeSelector 컴포넌트 단위 테스트
  - 모드 전환 시 상태 변화 테스트
  - 타이머/스톱워치 모드별 동작 테스트
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 20.2 음성 카운트 기능 테스트




  - VoiceCountService 단위 테스트
  - VoiceCountButton 컴포넌트 테스트
  - 음성 카운트 통합 테스트 (모킹 사용)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_