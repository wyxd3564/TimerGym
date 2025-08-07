---
inclusion: always
---

# Product Requirements & User Experience

## Core Product Identity

**Workout Timer App** - A distraction-free, accessible PWA for fitness timing with visual circular progress, repetition tracking, and smart notifications.

## Essential Features & Behavior

### Timer Interface
- Circular progress visualization with MM:SS display
- Countdown alerts at 3-2-1 seconds before completion
- Repetition counter with +/- controls
- Background operation with wake lock support

### Templates & Quick Start
- Default templates: 30s, 1min, 3min
- Custom template creation and management
- Drag-to-adjust time input for intuitive setting
- Template persistence across sessions

### Accessibility & PWA
- Full keyboard navigation support
- Screen reader compatibility with live announcements
- Responsive design for mobile-first usage
- Offline functionality with service worker
- Background sync for uninterrupted operation

### Notifications & Feedback
- Audio notifications with customizable sounds
- Haptic feedback via Vibration API
- Visual countdown indicators
- Settings for enabling/disabling each notification type

## User Experience Principles

### Simplicity First
- Single-screen interface with minimal navigation
- One-tap start/pause/reset controls
- Clear visual hierarchy with large touch targets
- No unnecessary features or distractions

### Reliability
- Continues operation when backgrounded
- Persistent state across app refreshes
- Graceful degradation when APIs unavailable
- Consistent timing accuracy

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard-only navigation support
- Screen reader announcements for timer state
- High contrast visual indicators

## Technical Constraints

- Must work offline as PWA
- Support for modern mobile browsers
- Minimal battery drain during background operation
- Fast startup time (<2 seconds)
- Responsive across device sizes (320px-1200px+)