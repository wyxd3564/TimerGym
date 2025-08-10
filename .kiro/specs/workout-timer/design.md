# 운동 타이머 앱 설계 문서

## 개요 (Overview)

운동 타이머 앱은 React 기반의 Progressive Web App(PWA)으로 설계되어 모바일과 데스크톱 환경에서 모두 사용할 수 있습니다. 앱은 직관적인 원형 타이머 인터페이스를 중심으로 하며, **타이머/스톱워치 모드 전환**, **음성 카운트 기능**, 반복 횟수 추적, 알림 기능, 그리고 빠른 시작을 위한 템플릿 기능을 제공합니다.

## 아키텍처 (Architecture)

### 기술 스택
- **Frontend**: React 18 with TypeScript
- **State Management**: React Context API + useReducer
- **Styling**: CSS Modules with CSS Custom Properties
- **Build Tool**: Vite
- **PWA**: Workbox for service worker
- **Audio**: Web Audio API
- **Vibration**: Vibration API (모바일)
- **Storage**: localStorage for settings persistence

### 아키텍처 패턴
```
┌─────────────────────────────────────────┐
│                UI Layer                 │
│  ┌─────────────┐ ┌─────────────────────┐│
│  │   Timer     │ │    Settings         ││
│  │ Component   │ │   Component         ││
│  └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│              State Layer                │
│  ┌─────────────┐ ┌─────────────────────┐│
│  │   Timer     │ │   Settings          ││
│  │  Context    │ │   Context           ││
│  └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│             Service Layer               │
│  ┌─────────────┐ ┌─────────────────────┐│
│  │   Timer     │ │   Notification      ││
│  │  Service    │ │   Service           ││
│  └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────┘
```

## 컴포넌트 및 인터페이스 (Components and Interfaces)

### 핵심 컴포넌트

#### 1. App Component
- 전체 애플리케이션의 루트 컴포넌트
- Context Provider들을 래핑
- PWA 설치 프롬프트 관리

#### 2. ModeSelector Component
- 헤더 아래에 위치한 타이머/스톱워치 모드 전환 버튼
- 버튼 크기를 1.5배 확대하여 사용성 향상
- 현재 활성 모드 시각적 표시
- 모드 전환 시 타이머 상태 초기화

#### 3. TimerDisplay Component
- 원형 진행률 표시기 (SVG 기반)
- 중앙에 시간 표시 (MM:SS 형식)
- 반복 횟수 표시
- **음성 버튼 (원 중앙에 위치)**
- 타이머와 스톱워치 모두 동일한 UX로 진행률 표시 (0에서 시작하여 시계방향으로 증가)
- 애니메이션 효과

#### 4. VoiceCountButton Component
- 원형 타이머 중앙에 위치한 음성 카운트 활성화 버튼
- 클릭 시 음성 카운트 모드 시작/중지
- 활성 상태 시각적 표시
- 1초마다 삐 소리 재생
- 두 번째 삐 소리 후 "하나, 둘, 셋..." 음성 카운트

#### 5. TimerControls Component
- 시작/정지/초기화 버튼
- 반복 횟수 증가/감소 버튼
- 시간 설정 입력 필드

#### 6. TimeTemplates Component
- 좌측 상단 템플릿 버튼 (팝업 트리거)
- 팝업 모달 형태의 시간 선택 인터페이스
- 기본 템플릿 (편집/삭제 불가)
- 커스텀 템플릿 (각각 편집/삭제 버튼 포함)
- 새 템플릿 추가 버튼

#### 7. TemplateForm Component
- 새 템플릿 생성/편집 폼
- 템플릿 이름 입력 필드
- 시간 설정 (분/초 드래그 조정 + 버튼 조정)
- 저장/취소 버튼

#### 8. DragTimeInput Component
- 드래그 가능한 시간 입력 컴포넌트
- 위아래 드래그로 값 증가/감소
- 터치 및 마우스 이벤트 지원
- 최소/최대값 제한

#### 9. Settings Component
- 우측 상단 설정 버튼으로 접근
- 알림 설정 (소리/진동 on/off)
- 알림음 선택
- 테마 설정 (다크/라이트 모드)

#### 10. Header Component
- 좌측: 템플릿 버튼 (팝업 트리거)
- 중앙: 앱 제목
- 우측: 설정 버튼

### 인터페이스 정의

```typescript
interface TimerState {
  mode: 'timer' | 'stopwatch';  // 타이머/스톱워치 모드
  duration: number;              // 설정된 총 시간 (초) - 타이머 모드용
  remainingTime: number;         // 남은 시간 (초) - 타이머 모드용
  elapsedTime: number;           // 경과 시간 (초) - 스톱워치 모드용
  repetitions: number;           // 현재 반복 횟수
  isRunning: boolean;            // 타이머/스톱워치 실행 상태
  isPaused: boolean;             // 일시정지 상태
  voiceCountActive: boolean;     // 음성 카운트 활성 상태
  voiceCountNumber: number;      // 현재 음성 카운트 숫자
}

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  selectedSound: string;
  theme: 'light' | 'dark';
}

interface TimerActions {
  SET_MODE: { mode: 'timer' | 'stopwatch' };
  START_TIMER: void;
  PAUSE_TIMER: void;
  RESET_TIMER: void;
  SET_DURATION: { duration: number };
  INCREMENT_REPETITIONS: void;
  DECREMENT_REPETITIONS: void;
  TICK: void;
  TOGGLE_VOICE_COUNT: void;
  INCREMENT_VOICE_COUNT: void;
}
```

## 데이터 모델 (Data Models)

### Timer Model
```typescript
class Timer {
  private intervalId: number | null = null;
  private callbacks: {
    onTick: (remainingTime: number) => void;
    onComplete: () => void;
    onCountdown: (seconds: number) => void;
  };

  start(duration: number): void;
  pause(): void;
  reset(): void;
  destroy(): void;
}
```

### Settings Model
```typescript
interface AppSettings {
  sound: {
    enabled: boolean;
    countdownSound: string;
    completionSound: string;
  };
  vibration: {
    enabled: boolean;
    pattern: number[];
  };
  ui: {
    theme: 'light' | 'dark';
    keepScreenOn: boolean;
  };
}
```

### Time Templates
```typescript
interface Template {
  id: string;
  name: string;
  duration: number; // 초 단위
  isDefault: boolean;
  createdAt: Date;
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: 'default-30s', name: '30초', duration: 30, isDefault: true, createdAt: new Date() },
  { id: 'default-1m', name: '1분', duration: 60, isDefault: true, createdAt: new Date() },
  { id: 'default-3m', name: '3분', duration: 180, isDefault: true, createdAt: new Date() }
];

interface TemplateState {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
}

interface TemplateActions {
  ADD_TEMPLATE: { template: Omit<Template, 'id' | 'createdAt'> };
  UPDATE_TEMPLATE: { id: string; updates: Partial<Template> };
  DELETE_TEMPLATE: { id: string };
  LOAD_TEMPLATES: void;
}

interface DragTimeInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
}

interface DragState {
  isDragging: boolean;
  startY: number;
  startValue: number;
  sensitivity: number; // 드래그 민감도 (픽셀당 변화량)
}
```

## 원형 진행률 표시기 설계

### SVG 기반 구현
```typescript
interface CircularProgressProps {
  progress: number;      // 0-100 사이의 진행률
  size: number;         // 원의 크기
  strokeWidth: number;  // 선의 두께
  color: string;        // 진행률 색상
}
```

### 애니메이션
- CSS transitions를 사용한 부드러운 진행률 변화
- 마지막 10초 동안 색상 변화 (초록 → 노랑 → 빨강)
- 완료 시 펄스 애니메이션

## 알림 시스템 설계

### 오디오 알림
```typescript
class AudioNotificationService {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer>;

  async loadSounds(): Promise<void>;
  playCountdown(): void;
  playCompletion(): void;
  playBeep(): void;  // 음성 카운트용 삐 소리
  setVolume(volume: number): void;
}

class VoiceCountService {
  private audioContext: AudioContext;
  private speechSynthesis: SpeechSynthesis;
  private beepInterval: number | null;
  private countInterval: number | null;
  private currentCount: number;

  startVoiceCount(): void;
  stopVoiceCount(): void;
  private playBeep(): void;
  private speakNumber(number: number): void;
  private getKoreanNumber(number: number): string;
}
```

### 진동 알림
```typescript
class VibrationService {
  private isSupported: boolean;

  vibrate(pattern: number[]): void;
  vibrateCountdown(): void;
  vibrateCompletion(): void;
}
```

## 백그라운드 실행 처리

### Service Worker
- 타이머 상태를 IndexedDB에 저장
- 백그라운드에서 시간 추적
- 포그라운드 복귀 시 상태 동기화

### Wake Lock API
- 화면이 꺼지지 않도록 방지 (선택적)
- 배터리 절약을 위한 설정 옵션 제공

## 상태 관리 설계

### Timer Context
```typescript
const TimerContext = createContext<{
  state: TimerState;
  dispatch: Dispatch<TimerAction>;
  services: {
    timer: Timer;
    audio: AudioNotificationService;
    vibration: VibrationService;
  };
}>();
```

### Settings Context
```typescript
const SettingsContext = createContext<{
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
}>();
```

### Template Context
```typescript
const TemplateContext = createContext<{
  state: TemplateState;
  dispatch: Dispatch<TemplateAction>;
  addTemplate: (name: string, duration: number) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
}>();
```

## 에러 처리 (Error Handling)

### 에러 유형
1. **Audio Context 에러**: 브라우저 정책으로 인한 오디오 재생 실패
2. **Vibration API 에러**: 지원하지 않는 디바이스
3. **Storage 에러**: localStorage 접근 실패
4. **Timer 에러**: setInterval/clearInterval 실패

### 에러 처리 전략
```typescript
class ErrorBoundary extends Component {
  // React Error Boundary 구현
  // 사용자 친화적인 에러 메시지 표시
  // 에러 로깅 및 복구 옵션 제공
}

// Service 레벨 에러 처리
const handleServiceError = (error: Error, service: string) => {
  console.error(`${service} error:`, error);
  // 대체 기능 제공 또는 graceful degradation
};
```

## 테스트 전략 (Testing Strategy)

### 단위 테스트
- **Timer Service**: 시간 계산 로직, 콜백 실행
- **Audio Service**: 사운드 로딩, 재생 로직
- **Utility Functions**: 시간 포맷팅, 진행률 계산

### 통합 테스트
- **Timer + UI**: 타이머 시작/정지/리셋 플로우
- **Settings + Storage**: 설정 저장/로드
- **Notification System**: 알림 트리거 및 실행

### E2E 테스트
- **전체 타이머 사이클**: 설정 → 시작 → 완료
- **템플릿 사용**: 빠른 시작 플로우
- **백그라운드 동작**: 탭 전환 후 복귀

### 테스트 도구
- **Jest**: 단위 테스트 프레임워크
- **React Testing Library**: 컴포넌트 테스트
- **Playwright**: E2E 테스트
- **MSW**: API 모킹 (필요시)

## 드래그 인터랙션 설계

### 드래그 시간 입력 구현
```typescript
const useDragTimeInput = (initialValue: number, min: number, max: number, step: number) => {
  const [value, setValue] = useState(initialValue);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    startValue: 0,
    sensitivity: 2 // 2픽셀당 1단위 변화
  });

  const handleDragStart = (clientY: number) => {
    setDragState({
      isDragging: true,
      startY: clientY,
      startValue: value,
      sensitivity: 2
    });
  };

  const handleDragMove = (clientY: number) => {
    if (!dragState.isDragging) return;
    
    const deltaY = dragState.startY - clientY; // 위로 드래그하면 양수
    const deltaValue = Math.floor(deltaY / dragState.sensitivity) * step;
    const newValue = Math.max(min, Math.min(max, dragState.startValue + deltaValue));
    
    setValue(newValue);
  };

  const handleDragEnd = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  return { value, setValue, dragState, handleDragStart, handleDragMove, handleDragEnd };
};
```

### 터치 및 마우스 이벤트 처리
- **마우스**: mousedown, mousemove, mouseup
- **터치**: touchstart, touchmove, touchend
- **드래그 방향**: 위로 드래그 시 값 증가, 아래로 드래그 시 값 감소
- **시각적 피드백**: 드래그 중 배경색 변화 또는 하이라이트

## 성능 최적화

### 렌더링 최적화
- React.memo를 사용한 불필요한 리렌더링 방지
- useMemo/useCallback을 통한 계산 결과 캐싱
- 타이머 틱을 위한 최적화된 상태 업데이트
- 드래그 이벤트 throttling으로 성능 향상

### 메모리 관리
- 컴포넌트 언마운트 시 타이머 정리
- 오디오 리소스 해제
- 이벤트 리스너 정리 (드래그 이벤트 포함)

### 번들 최적화
- 코드 스플리팅 (Settings 컴포넌트)
- Tree shaking을 통한 불필요한 코드 제거
- 오디오 파일 lazy loading

## 접근성 (Accessibility)

### 키보드 네비게이션
- 모든 버튼에 적절한 tabindex 설정
- 스페이스바/엔터키로 타이머 시작/정지
- 화살표 키로 시간 조정

### 스크린 리더 지원
- ARIA 레이블 및 역할 정의
- 타이머 상태 변경 시 live region 업데이트
- 진행률 정보를 텍스트로 제공

### 시각적 접근성
- 고대비 모드 지원
- 색상에만 의존하지 않는 정보 전달
- 충분한 터치 타겟 크기 (최소 44px)

## 화면 와이어프레임 (Screen Wireframes)

### 메인 타이머 화면
```
┌─────────────────────────────────────────┐
│ [템플릿]        운동 타이머        ⚙️[설정]│
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────┐   ┌───────────────┐  │
│  │     타이머     │   │   스톱워치     │  │
│  └───────────────┘   └───────────────┘  │
│   (활성 모드 - 1.5배)   (비활성 모드 - 1.5배)│
│                                         │
│              05:00                      │
│         (시간 표시 - 큰 폰트)              │
│                                         │
│        ╭─────────────────╮               │
│       ╱                   ╲              │
│      ╱       [  15  ]      ╲             │
│     │      (반복 횟수)        │            │
│     │                       │            │
│     │    ████████████░░░    │            │
│     │   (원형 진행률 바)      │            │
│     │         🎤            │            │
│     │     (음성 버튼)        │            │
│      ╲                     ╱             │
│       ╲___________________╱              │
│                                         │
│    [  -  ]              [  +  ]        │
│  (횟수 감소)            (횟수 증가)        │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  시작   │ │  정지   │ │ 초기화  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 시간 설정 모드 (메인 화면 상단 시간 클릭 시)
```
┌─────────────────────────────────────────┐
│              시간 설정                    │
├─────────────────────────────────────────┤
│                                         │
│              분    :    초               │
│           ┌─────┐   ┌─────┐              │
│           │  05 │ : │  00 │              │
│           └─────┘   └─────┘              │
│              ▲        ▲                 │
│           ┌─────┐   ┌─────┐              │
│           │  +  │   │  +  │              │
│           └─────┘   └─────┘              │
│           ┌─────┐   ┌─────┐              │
│           │  -  │   │  -  │              │
│           └─────┘   └─────┘              │
│              ▼        ▼                 │
│                                         │
│        ┌─────────┐ ┌─────────┐          │
│        │   확인   │ │  취소   │          │
│        └─────────┘ └─────────┘          │
│                                         │
└─────────────────────────────────────────┘
```

### 템플릿 선택 화면 (좌측 상단 템플릿 버튼 클릭 시)
```
┌─────────────────────────────────────────┐
│              빠른 시작 선택                │
├─────────────────────────────────────────┤
│                                         │
│          ┌─────────────────┐            │
│          │      30초       │            │
│          └─────────────────┘            │
│                                         │
│          ┌─────────────────┐            │
│          │      1분        │            │
│          └─────────────────┘            │
│                                         │
│          ┌─────────────────┐            │
│          │      3분        │            │
│          └─────────────────┘            │
│                                         │
│  ┌─────────────────┐ [✏️] [🗑️]          │
│  │   내 운동 1분30초  │                   │
│  └─────────────────┘                   │
│                                         │
│  ┌─────────────────┐ [✏️] [🗑️]          │
│  │   플랭크 2분     │                   │
│  └─────────────────┘                   │
│                                         │
│          ┌─────────────────┐            │
│          │ + 새 템플릿 추가  │            │
│          └─────────────────┘            │
│                                         │
│          ┌─────────────────┐            │
│          │      닫기       │            │
│          └─────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

### 새 템플릿 추가 화면 (+ 새 템플릿 추가 버튼 클릭 시)
```
┌─────────────────────────────────────────┐
│              새 템플릿 추가                │
├─────────────────────────────────────────┤
│                                         │
│  템플릿 이름                             │
│  ┌─────────────────────────────────────┐ │
│  │ 내 운동                             │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  시간 설정                               │
│              분    :    초               │
│           ┌─────┐   ┌─────┐              │
│           │  01 │ : │  30 │              │
│           └─────┘   └─────┘              │
│        (위아래 드래그로 조정)              │
│                                         │
│           ┌─────┐   ┌─────┐              │
│           │  +  │   │  +  │              │
│           └─────┘   └─────┘              │
│           ┌─────┐   ┌─────┐              │
│           │  -  │   │  -  │              │
│           └─────┘   └─────┘              │
│                                         │
│        ┌─────────┐ ┌─────────┐          │
│        │   저장   │ │  취소   │          │
│        └─────────┘ └─────────┘          │
│                                         │
└─────────────────────────────────────────┘
```

### 설정 화면
```
┌─────────────────────────────────────────┐
│                  설정                    │
├─────────────────────────────────────────┤
│                                         │
│  알림 설정                               │
│  ┌─────────────────────────────────────┐ │
│  │ 소리 알림        [●○] ON/OFF       │ │
│  │ 진동 알림        [●○] ON/OFF       │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  알림음 선택                             │
│  ┌─────────────────────────────────────┐ │
│  │ ○ 기본음 (띵)                       │ │
│  │ ● 벨소리                            │ │
│  │ ○ 비프음                            │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  화면 설정                               │
│  ┌─────────────────────────────────────┐ │
│  │ 다크 모드        [○●] ON/OFF       │ │
│  │ 화면 켜두기      [●○] ON/OFF       │ │
│  └─────────────────────────────────────┘ │
│                                         │
│              ┌─────────┐                │
│              │   완료   │                │
│              └─────────┘                │
│                                         │
└─────────────────────────────────────────┘
```

### 타이머 실행 중 화면 (카운트다운 상태)
```
┌─────────────────────────────────────────┐
│ [템플릿]        운동 타이머        ⚙️[설정]│
│ (비활성화)                      (비활성화)│
├─────────────────────────────────────────┤
│                                         │
│              02:47                      │
│         (남은 시간 - 큰 폰트)              │
│                                         │
│        ╭─────────────────╮               │
│       ╱                   ╲              │
│      ╱       [  23  ]      ╲             │
│     │      (반복 횟수)        │            │
│     │                       │            │
│     │    ████████░░░░░░░    │            │
│     │   (진행 중인 원형 바)    │            │
│      ╲                     ╱             │
│       ╲___________________╱              │
│                                         │
│    [  -  ]              [  +  ]        │
│  (횟수 감소)            (횟수 증가)        │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  일시정지│ │  정지   │ │ 초기화  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### 타이머 완료 상태 (메인 화면에서 완료 표시)
```
┌─────────────────────────────────────────┐
│ [템플릿]        운동 타이머        ⚙️[설정]│
├─────────────────────────────────────────┤
│                                         │
│              00:00                      │
│         (완료 - 빨간색 폰트)               │
│                                         │
│        ╭─────────────────╮               │
│       ╱                   ╲              │
│      ╱       [  25  ]      ╲             │
│     │      (최종 횟수)        │            │
│     │                       │            │
│     │    ████████████████    │            │
│     │   (완료된 원형 바 - 빨강) │            │
│      ╲                     ╱             │
│       ╲___________________╱              │
│                                         │
│    [  -  ]              [  +  ]        │
│  (횟수 감소)            (횟수 증가)        │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  시작   │ │  정지   │ │ 초기화  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

## 보안 고려사항

### 데이터 보호
- 민감한 정보 없음 (개인정보 수집하지 않음)
- localStorage 사용 시 XSS 방지
- CSP 헤더 설정

### PWA 보안
- HTTPS 필수
- Service Worker 스크립트 무결성 검증
- 안전한 오리진에서만 실행