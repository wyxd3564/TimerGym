---
inclusion: always
---

# Workout Timer Product Guidelines

## Product Identity & Core Features

**Workout Timer PWA** - Distraction-free fitness timer with circular progress, voice countdown, and accessibility-first design.

### Required UI Components
- **CircularProgress**: SVG-based timer visualization with MM:SS center display
- **TimerDisplay**: Main interface with start/pause/reset controls
- **ModeSelector**: Toggle between Timer/Stopwatch modes
- **VoiceCountButton**: Enable/disable voice countdown (3-2-1)
- **Header**: App title and settings access

### Timer Behavior Rules
- Voice countdown triggers at 3-2-1 seconds before completion
- Timer continues in background with Wake Lock API
- State persists across app refreshes and browser sessions
- Support both Timer (countdown) and Stopwatch (count-up) modes

### Template System
- Default templates: 30s, 1min, 3min intervals
- Custom duration input with validation (1s - 99:59 max)
- Templates stored in localStorage with fallback defaults
- Quick-select interface for common workout intervals

## UX Design Principles

### Mobile-First Requirements
- Touch targets minimum 44px for accessibility
- Single-screen interface - no navigation required
- Large, clear typography for timer display (minimum 24px)
- High contrast colors for visibility in gym environments

### Accessibility Standards
- WCAG 2.1 AA compliance mandatory
- Screen reader announcements for timer state changes
- Keyboard navigation for all interactive elements
- Voice countdown as audio accessibility feature

### Performance Constraints
- App startup under 2 seconds
- Smooth 60fps circular progress animation
- Minimal battery drain during background operation
- Graceful degradation when browser APIs unavailable

## Feature Implementation Guidelines

### Voice Countdown System
- Use Web Speech API or Web Audio API for voice synthesis
- Provide enable/disable toggle in UI
- Fallback to visual-only countdown if audio unavailable
- Test across different browser implementations

### PWA Requirements
- Service worker for offline functionality
- App manifest for home screen installation
- Background sync for uninterrupted timer operation
- Cache strategy for essential assets

### Browser API Integration
- **Wake Lock API**: Prevent screen sleep during active timer
- **Vibration API**: Haptic feedback on timer completion
- **Web Audio API**: Sound notifications and voice countdown
- **localStorage**: Template and settings persistence

## Development Constraints

### User Flow Priorities
1. Quick start with default templates (highest priority)
2. Custom duration setting (medium priority)
3. Settings and customization (lowest priority)

### Error Handling Requirements
- Graceful fallbacks for missing browser APIs
- Clear user feedback for invalid timer durations
- Recovery from background tab limitations
- Offline functionality with cached resources

### Testing Focus Areas
- Timer accuracy across different browsers
- Background operation reliability
- Voice countdown functionality
- Accessibility compliance validation