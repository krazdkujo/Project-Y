# Folder Context: input/handlers

## Purpose
Specialized input handlers for specific game systems and interactions. Contains focused handlers for ability activation, combat commands, and system-specific input processing.

## Key Files
- `AbilityHandler.js` - Ability activation handler managing hotkey-based ability usage with validation and execution

## Dependencies
- Internal: `../../abilities/core/AbilityEngine.js`, `../../abilities/core/AbilityRegistry.js`, `../../abilities/core/AbilitySlotManager.js`, `../../game/core/GameManager.js`
- External: None - pure JavaScript implementation

## Integration Points
**Ability Activation System**:
- Handles hotkey-based ability activation (keys 1-9)
- Validates active character and ability slot availability
- Integrates with AbilityEngine for ability execution
- Provides feedback through adventure log system

**Character Validation**:
- Active character detection through GameManager
- Character state validation before ability usage
- Combat state awareness for ability restrictions
- Character availability and status checking

**Ability Slot Integration**:
- Interfaces with AbilitySlotManager for slot management
- Hotkey-to-slot mapping (1-9 keys to 0-8 slot indices)
- Ability availability checking in assigned slots
- Slot validation and error messaging

**Combat System Integration**:
- Ability execution through AbilityEngine
- Combat result processing and effect display
- AP consumption validation and management
- Turn-based ability usage coordination

## Handler Architecture
**Ability Execution Flow**:
1. Receive ability hotkey input (1-9)
2. Validate active character availability
3. Check ability slot assignment for hotkey
4. Execute ability through AbilityEngine
5. Process results and provide user feedback

**Error Handling**:
- No active character detection
- Empty ability slot messaging
- Ability execution failure handling
- User feedback through log system

**Result Processing**:
- Success state handling and messaging
- Effect display and formatting
- Combat log integration
- Status update coordination

## Future Extensions
- Complex ability combinations and sequences
- Ability targeting and selection handlers
- Context-sensitive ability restrictions
- Advanced ability feedback and visualization

## Last Updated
2025-08-27: Created ability handler documentation covering hotkey activation and ability execution coordination