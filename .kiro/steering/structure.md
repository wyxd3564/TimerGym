---
inclusion: always
---

# Code Structure & Architecture Guidelines

## File Organization Rules

### Component Structure
- Each component lives in `src/components/ComponentName/`
- Required files: `ComponentName.tsx`, `ComponentName.module.css`
- Optional: `__tests__/ComponentName.test.tsx`
- Always export as default from the main component file
- Use barrel exports in `src/components/index.ts`

### Service Layer Pattern
- Business logic belongs in `src/services/`
- Services are classes with static methods or plain objects
- Inject services via React Context, never import directly in components
- Each service has comprehensive unit tests in `__tests__/`

### Context Architecture
- State management via Context + useReducer pattern
- Contexts in `src/contexts/` with corresponding custom hooks in `src/hooks/`
- Context providers wrap logical boundaries, not individual components
- Always provide TypeScript interfaces for context values

## Naming Conventions (Enforced)

### Files & Components
- Components: `PascalCase` (TimerDisplay.tsx)
- Hooks: `camelCase` starting with "use" (useTimer.ts)
- Services: `PascalCase` ending with "Service" (StorageService.ts)
- Types: `PascalCase` with descriptive names (TimerState, TemplateConfig)

### CSS & Styling
- CSS Modules: `ComponentName.module.css`
- CSS classes: `kebab-case` in files, `camelCase` in TypeScript
- CSS custom properties: `--kebab-case` in `:root`
- Use CSS Modules exclusively, no global styles except in `src/styles/`

### Constants & Variables
- Constants: `SCREAMING_SNAKE_CASE`
- Variables: `camelCase`
- Interface properties: `camelCase`

## Import/Export Standards

### Path Resolution
- Use `@/` alias for all src imports: `import { Timer } from '@/services'`
- Relative imports only within same directory
- Always use barrel exports from directory index files

### Export Patterns
```typescript
// Default exports for components and services
export default ComponentName;

// Named exports for utilities and types
export { formatTime, validateTemplate };
export type { TimerState, TemplateConfig };
```

## Testing Requirements

### Test Structure
- Co-locate tests in `__tests__/` folders
- Mirror source file names with `.test.tsx` suffix
- Use React Testing Library for component tests
- Mock services and contexts in integration tests

### Coverage Expectations
- All services must have unit tests
- All custom hooks must have tests
- Components need interaction and rendering tests
- Context providers need state management tests

## Architecture Patterns (Required)

### State Management
- Use Context + useReducer for complex state
- Custom hooks encapsulate context consumption
- No direct useState in components for shared state
- Immutable state updates only

### Component Composition
- Functional components with TypeScript interfaces
- Props interfaces defined inline or in types/
- No class components
- Use React.memo for performance optimization

### Service Integration
- Services accessed via Context providers only
- No direct service imports in components
- Services handle all external API calls and side effects
- Error handling at service layer with proper TypeScript types

## Code Quality Standards

### TypeScript Usage
- Strict mode enabled, no `any` types
- Interface over type aliases for object shapes
- Proper generic constraints and utility types
- Export all types from `src/types/index.ts`

### Error Handling
- Use Result/Either pattern for service methods
- Proper error boundaries for component failures
- Graceful degradation for missing browser APIs
- User-friendly error messages, technical details in console