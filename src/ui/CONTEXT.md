# Folder Context: ui

## Purpose
User interface components for the tactical ASCII roguelike that maintain strict ASCII visual standards while providing interactive gameplay interfaces. Contains specialized UI systems for different game mechanics.

## Key Files
- `lockpicking/LockpickingUI.js` - Complete ASCII interface for lockpicking system with interactive panels and visual feedback
- `lockpicking/CONTEXT.md` - Documentation for lockpicking UI system

## Dependencies
- Internal: EventSystem for notifications, individual game systems for data and mechanics
- External: Main game UI system for message display and panel integration

## Integration Points
The UI systems connect to:
- **Main Game UI**: Integration through event emissions (ui:message, ui:show_panel)
- **ASCII Standards**: Maintains 40-character box-drawing panels (┌─┐│└┘├┤┬┴┼)
- **Input System**: Handles 1-9 hotkeys and ESC interactions
- **Event System**: Reactive UI updates from game system events
- **Visual Standards**: Terminal green color scheme and consistent formatting

## UI Architecture
- **Modular Design**: Each system has dedicated UI components
- **Event-Driven**: UI responds to game events rather than polling
- **ASCII Compliance**: All interfaces use ASCII box-drawing characters
- **Consistent Layout**: Standardized panel width and formatting
- **Interactive Elements**: Clear hotkey mapping and action feedback

## Visual Standards
- 40-character wide panels for consistency
- Box-drawing character usage: ┌─┐│└┘├┤┬┴┼
- Terminal green color scheme (#00ff00 on #000000)
- Message categorization (success, error, warning, info)
- Clear action mapping (1-9 for choices, ESC for cancel)

## Last Updated
2025-08-27: Created with lockpicking UI system implementation