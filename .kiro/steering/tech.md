---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Stack Requirements

- **React 19.1.0** with TypeScript - Use functional components only, no class components
- **Vite 7.0.4** - Build tool with HMR, use `@/` path alias for all src imports
- **CSS Modules** - All styling via `.module.css` files, camelCase in TypeScript
- **Vitest + React Testing Library** - Co-locate tests in `__tests__/` folders
- **ESLint** - Strict TypeScript rules, no `any` types allowed

## Critical Build Configuration

- **Path Alias**: Always use `@/` for src imports: `import { Timer } from '@/services'`
- **CSS Modules**: Classes auto-converted to camelCase in TypeScript
- **TypeScript**: Strict mode enabled, separate configs for app/node environments
- **Testing**: Use `jsdom` environment, React Testing Library for component tests

## Development Commands

```bash
npm run dev          # Development server (use for testing changes)
npm run build        # Production build (run before deployment)
npm run test         # Watch mode testing (use during development)
npm run test:run     # Single test run (use in CI/scripts)
npm run lint         # Code quality checks (fix issues before committing)
```

## Architecture Enforcement

### State Management Pattern
- **Context + useReducer** for all shared state (never useState for shared data)
- Custom hooks encapsulate context consumption: `useTimer()`, `useSettings()`
- Services accessed only via Context providers, never direct imports in components

### Component Structure Rules
- Each component in `src/components/ComponentName/` with required files:
  - `ComponentName.tsx` (default export)
  - `ComponentName.module.css`
  - `__tests__/ComponentName.test.tsx`
- Use barrel exports in `src/components/index.ts`

### Service Layer Pattern
- Business logic in `src/services/` as classes with static methods
- Services handle: Timer logic, Storage, PWA features, Background sync
- All services must have comprehensive unit tests
- Error handling via Result/Either pattern, no throwing exceptions

## Browser API Integration

- **Web Audio API**: Notification sounds (graceful degradation required)
- **Vibration API**: Haptic feedback (check availability first)
- **Wake Lock API**: Background timer operation
- **Service Workers**: PWA functionality and offline support
- **IndexedDB**: Template and settings persistence

## Testing Requirements

- **Unit Tests**: All services, hooks, and utilities
- **Component Tests**: Rendering, interactions, accessibility
- **Integration Tests**: Context providers and state management
- **E2E Tests**: Playwright for critical user flows
- Mock external APIs and browser features in tests

## Code Quality Standards

- **TypeScript**: Strict mode, proper interfaces, no `any` types
- **Accessibility**: WCAG 2.1 AA compliance, screen reader support
- **Performance**: React.memo for optimization, lazy loading where appropriate
- **PWA**: Offline-first design, background operation support