# Folder Context: input/core

## Purpose
Core input management system providing centralized keyboard and input event handling for the single-player ASCII roguelike. Manages UI state-aware input routing and key mapping coordination.

## Key Files
- `InputManager.js` - Central input event coordinator with keyboard handling, UI state management, and input validation

## Dependencies
- Internal: `../../character/generator/CharacterGenerator.js`, various UI components for state-specific input handling
- External: None - pure DOM event handling

## Integration Points
**Keyboard Event Management**:
- Global keydown event handling with input field detection
- Key mapping system for different UI states
- Input validation and focus management
- Event delegation for state-specific handlers

**UI State Management**:
- Tracks current UI state (guild, dungeon, combat, character creation)
- State-aware input routing and key mapping
- Context-sensitive command handling
- Input field focus detection and bypass

**Input Validation**:
- Active element detection for input fields
- Input field focus bypass for game controls
- Key normalization and mapping
- Event prevention for handled inputs

**Character Name Input Integration**:
- Handles character creation name input events
- Integrates with CharacterGenerator for real-time validation
- Input field management and state updates
- Form input coordination with game systems

## Key Handler Architecture
**Handler Registration**:
- Map-based key handler registration system
- Dynamic handler assignment based on UI state
- Handler priority and override management
- Event propagation control

**State-Specific Routing**:
- Different key mappings for different UI states
- Context-aware command interpretation
- State transition input handling
- Input focus management across states

**Input Processing Flow**:
1. Capture global keydown events
2. Check for active input field focus
3. Normalize key representation
4. Route to appropriate handler based on UI state
5. Execute handler and manage event propagation

## Future Integration Points
- Extended UI state management for additional game modes
- Complex input combination handling
- Gamepad and alternative input device support
- Input recording and replay systems

## Last Updated
2025-08-27: Created core input management documentation covering centralized input handling and UI state coordination