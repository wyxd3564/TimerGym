# Requirements Document

## Introduction

This document defines the functional and non-functional requirements for developing a simple and intuitive workout timer application. Users can set workout times, focus on their exercises through visual feedback (circular progress) and notifications, track repetition counts, and quickly start workouts using preset time templates.

## Requirements

### Requirement 1: Mode Selection

**User Story:** As a user, I want to switch between timer and stopwatch modes, so that I can use the app for different types of workouts.

#### Acceptance Criteria

1. WHEN the app is displayed THEN the system SHALL show two mode buttons below the header: "타이머" and "스톱워치".
2. WHEN the user presses the "타이머" button THEN the system SHALL switch to timer mode with countdown functionality.
3. WHEN the user presses the "스톱워치" button THEN the system SHALL switch to stopwatch mode with count-up functionality.
4. WHEN in timer mode THEN the system SHALL display time counting down from the set time to 00:00.
5. WHEN in stopwatch mode THEN the system SHALL display time counting up from 00:00.
6. WHEN switching modes THEN the system SHALL reset the current timer/stopwatch to initial state.
7. WHEN the mode buttons are displayed THEN the system SHALL make them 1.5 times wider than standard buttons for better usability.

### Requirement 2: Timer Setup and Control

**User Story:** As a user, I want to set a desired time and start/stop the timer, so that I can exercise for the planned duration.

#### Acceptance Criteria

1. WHEN in timer mode THEN the system SHALL show the countdown time in MM:SS format at the top of the screen.
2. WHEN in stopwatch mode THEN the system SHALL show the elapsed time in MM:SS format at the top of the screen.
3. WHEN the timer starts in timer mode THEN the system SHALL visually increase the circular graph proportionally to the elapsed time (consistent UX with stopwatch).
4. WHEN the timer starts in stopwatch mode THEN the system SHALL visually increase the circular graph proportionally to the elapsed time.
5. WHEN the user presses the 'start' button THEN the system SHALL start the timer/stopwatch according to the current mode.
6. WHEN the user presses the 'pause' button while running THEN the system SHALL pause the timer/stopwatch.
7. WHEN the user presses the 'reset' button while paused THEN the system SHALL reset to the initial state according to the current mode.

### Requirement 3: Voice Count Feature

**User Story:** As a user, I want to activate voice counting with audio cues, so that I can count repetitions without looking at the screen.

#### Acceptance Criteria

1. WHEN the circular timer is displayed THEN the system SHALL show a voice button in the center of the circle.
2. WHEN the user presses the voice button THEN the system SHALL start playing a beep sound every 1 second.
3. WHEN the voice counting is active THEN the system SHALL play two beep sounds first, then start voice counting "하나, 둘, 셋..." in Korean.
4. WHEN the voice button is pressed again THEN the system SHALL stop the voice counting and beep sounds.
5. WHEN voice counting reaches a number THEN the system SHALL continue incrementally ("하나, 둘, 셋, 넷, 다섯..." etc.).
6. WHEN the voice counting is active THEN the system SHALL visually indicate the active state of the voice button.

### Requirement 4: Repetition Count Tracking

**User Story:** As a user, I want to track my exercise repetitions, so that I can easily monitor how many times I've repeated an exercise.

#### Acceptance Criteria

1. WHEN the timer is displayed THEN the system SHALL show the current repetition count as a number inside the circular graph.
2. WHEN the user presses the '+' button THEN the system SHALL increase the repetition count by 1.
3. WHEN the user presses the '-' button THEN the system SHALL decrease the repetition count by 1, but the count SHALL NOT go below 0.
4. WHEN the 'reset' button is pressed THEN the system SHALL reset the repetition count to 0.

### Requirement 5: Timer Notifications

**User Story:** As a user, I want to receive sound and vibration alerts when the timer ends, so that I can know when my workout is complete without looking at the screen.

#### Acceptance Criteria

1. WHEN the timer has 3, 2, or 1 seconds remaining THEN the system SHALL play the configured countdown sound ('beep') for each second.
2. WHEN the timer reaches 0 seconds THEN the system SHALL play the configured completion sound and trigger vibration.
3. WHEN the user accesses settings THEN the system SHALL allow the user to enable or disable sound alerts and vibration alerts independently.

### Requirement 6: Time Templates

**User Story:** As a user, I want to quickly start the timer with preset times, so that I can reduce the hassle of setting time every time.

#### Acceptance Criteria

1. WHEN the system is initialized THEN the system SHALL provide default templates for 30 seconds, 1 minute, and 3 minutes.
2. WHEN the user presses a specific time template button THEN the system SHALL immediately set the timer to that time.
3. WHEN the user creates a custom template THEN the system SHALL allow setting both name and time duration.
4. WHEN the user manages custom templates THEN the system SHALL allow editing or deleting user-created templates.
5. WHEN the user attempts to delete default templates THEN the system SHALL prevent deletion of default templates.

## Non-functional Requirements

### NFR-1: Background Operation
The application SHALL continue timer functionality without interruption when the screen is turned off or the app is moved to background state.

### NFR-2: Performance
The app UI SHALL operate smoothly and respond within 0.2 seconds for button clicks and screen transitions.

### NFR-3: Compatibility
The app SHALL function properly on the latest versions of iOS and Android operating systems.