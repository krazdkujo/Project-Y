# Folder Context: core

## Purpose
Core game systems that provide foundational functionality for the tactical ASCII roguelike. Contains the central game state management and event-driven communication system that all other systems depend on.

## Key Files
- `GameState.js` - Central game state management with serialization, character data, location tracking, and lockpicking system integration
- `EventSystem.js` - Event-driven communication system for decoupled component interactions

## Dependencies
- Internal: None - these are the foundational systems
- External: None - pure JavaScript implementation

## Integration Points
The core systems connect to:
- **All Game Systems**: GameState provides centralized data storage and persistence
- **UI Components**: EventSystem enables reactive UI updates and notifications
- **Save/Load**: Complete game state serialization including complex Maps and Sets
- **Lockpicking System**: Extended GameState to handle object states, keys, and statistics
- **Character System**: Persistent character data, skills, and progression

## GameState Features
- **Complete Serialization**: Handles Maps, Sets, and complex nested objects
- **Lockpicking Integration**: Stores object states, keys found, trap states, and statistics
- **Location Management**: Current room/dungeon tracking
- **Character Persistence**: Full character data including skills and equipment
- **Cross-System Data**: Shared state accessible by all game systems

## EventSystem Features
- **Decoupled Communication**: Systems communicate without direct dependencies
- **UI Notifications**: Event-driven messages for user feedback
- **System Integration**: Lockpicking events, trap triggers, key usage notifications
- **Extensible Architecture**: Easy addition of new event types and listeners

## Last Updated
2025-08-27: Enhanced GameState with lockpicking system support and complex object serialization