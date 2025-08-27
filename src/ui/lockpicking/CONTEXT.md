# Folder Context: ui/lockpicking

## Purpose
Provides ASCII-based user interface components for the lockpicking system. Handles visual feedback, player interactions, and interface panels that integrate with the main game's UI system while maintaining the tactical ASCII roguelike's visual standards.

## Key Files
- `LockpickingUI.js` - Complete UI system for lockpicking interactions with ASCII panels, event handling, and visual feedback

## Dependencies
- Internal: LockpickingSystem (mechanics), GameState (data), EventSystem (notifications)
- External: Main UI system for message display and panel integration

## Integration Points
The lockpicking UI connects to:
- **Event System**: Listens for lockpicking results, trap triggers, and key usage events
- **Main UI**: Emits ui:message and ui:show_panel events for integration
- **Game Controls**: Handles 1-9 hotkey interactions and ESC cancellation
- **Character System**: Displays skill levels, AP costs, and success chances
- **ASCII Standards**: Maintains box-drawing character formatting (┌─┐│└┘├┤┬┴┼)

## UI Features
- **Interactive Panels**: Multi-choice interfaces for lockpicking, trap handling, and key usage
- **Real-time Feedback**: Success/failure messages with consequence descriptions
- **Skill Display**: Shows character lockpicking and nimble_fingers skill levels
- **Success Calculation**: Real-time success chance display based on current skills
- **Trap Interface**: Separate panel for trap detection and disarming options
- **Statistics Panel**: Comprehensive lockpicking progress and achievement display

## Visual Standards
- Consistent 40-character wide panels using ASCII box-drawing
- Terminal green color scheme integration
- Clear action mapping (1-9 keys for choices, ESC for cancel)
- Message categorization (success, error, warning, info)

## Last Updated
2025-08-27: Complete UI implementation supporting all lockpicking system features