# Theme 2: Tactical Command Design Specification

## Overview
Military/tactical interface aesthetic emphasizing precision, hierarchy, and operational efficiency. Designed for users who prefer structured, command-oriented interfaces.

## Visual Identity

### Color Scheme
- **Primary Color**: `#00FF41` (Military terminal green)
- **Background**: `#001100` (Dark military green)
- **Secondary**: `#00CC33` (Operational green)
- **Accent**: `#FFFF00` (Alert yellow for active units)
- **Warning**: `#FFA500` (Orange for caution states)
- **Critical**: `#FF0000` (Red for hostile/damage)
- **Neutral**: `#666666` (Gray for inactive elements)

### Typography
```css
font-family: 'Consolas', 'Monaco', 'Ubuntu Mono', monospace;
font-size: 11px;
line-height: 1.0;
font-weight: 600; /* Slightly bolder for military feel */
letter-spacing: 0.5px;
text-transform: uppercase; /* Headers in caps */
```

### Box Drawing Characters
- **Heavy Lines**: `┏━┓┃┗┛┣┫┳┻╋` (Primary borders)
- **Double Lines**: `╔═╗║╚╝╠╣╦╩╬` (Important sections)
- **Usage**: Heavy lines for command panels, double for critical info

### Status Indicators
- **Filled**: `█` (Active systems)
- **Degraded**: `▓` (Partial functionality)
- **Minimal**: `▒` (Low status)
- **Offline**: `░` (Inactive systems)

## Military Terminology Integration

### Interface Language
- **Players** → **Units/Operatives**
- **Skills** → **Training/Specializations**
- **Game Lobby** → **Mission Briefing Room**
- **Character Creation** → **Soldier Requisition**
- **Health Points** → **Unit Integrity**
- **Action Points** → **Combat Readiness**

### Command Hierarchy Indicators
- **Commander**: `▶▶` (Double chevron)
- **Officer**: `▶` (Single chevron)
- **Operative**: `●` (Solid dot)
- **Ready Status**: `█` Active, `░` Standby

## Layout Specifications

### Panel Structure
- **Military Grid**: Precise alignment with tactical spacing
- **Command Headers**: All caps with mission-style formatting
- **Status Blocks**: Clearly defined operational areas
- **Priority Indicators**: Color-coded threat/readiness levels

### Quick Skill Bar Format (Adapted)
```
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃     COMBAT OPTIONS    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━┫
┃ [1] ADVANCE      (1AP)┃
┃ [2] FIRE         (0AP)┃
┃ [3] BREACH       (2AP)┃
┃ [4] FRAG OUT     (3AP)┃
┃ [5] FIRST AID    (1AP)┃
┃ [6] OVERWATCH    (1AP)┃
┃ [7] ----------   ---- ┃
┃ [8] ----------   ---- ┃
┃ [9] ----------   ---- ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛
```

## Screen-Specific Adaptations

### Main Menu → Command Center
- Military-style ASCII header
- Mission control interface
- Status briefings and intel
- Command authentication feel

### Character Creation → Soldier Requisition
- Military training categories
- Specialization tracks
- Combat readiness preview
- Equipment loadout display

### Game Lobby → Mission Briefing Room
- Unit roster with military ranks
- Operational parameters
- Mission objectives display
- Command structure hierarchy

### Main Gameplay → Tactical Display
- Grid reference positioning
- Unit status indicators
- Threat assessment panel
- Combat action commands

### Character Sheet → Personnel File
- Service record format
- Training certifications
- Equipment manifest
- Combat effectiveness ratings

### Inventory → Equipment Manifest
- Military categorization
- Load-out configuration
- Supply status tracking
- Equipment condition reports

### Settings → Tactical Configuration
- Operational parameters
- System preferences
- Mission parameters
- Equipment configuration

### Guild/Social → Command Structure
- Unit organization
- Mission coordination
- Command communications
- Resource allocation

## Interaction Patterns

### Military Commands
- **Primary**: [EXECUTE], [ABORT], [STANDBY]
- **Navigation**: Alpha-numeric designations
- **Confirmation**: Military-style confirmations
- **Hierarchy**: Rank-based access controls

### Status Communication
- **Unit Ready**: `▶ OPERATIONAL`
- **Unit Standby**: `○ STANDBY`
- **Unit Offline**: `- OFFLINE`
- **Mission Status**: Color-coded indicators

## Accessibility Considerations

### Military Standards
- High contrast for operational environments
- Clear status indicators
- Redundant information display
- Keyboard-optimized controls

### Visual Hierarchy
- Command structure clarity
- Priority-based color coding
- Operational status indicators
- Mission-critical information prominence

## Implementation Guidelines

### CSS Classes
```css
.tactical-command {
  background-color: #001100;
  color: #00FF41;
  font-family: 'Consolas', monospace;
  font-weight: 600;
}

.tactical-panel {
  border: 2px solid #00FF41;
  border-style: solid;
  padding: 1ch;
  margin: 3px;
}

.tactical-header {
  text-transform: uppercase;
  font-weight: bold;
  color: #FFFF00;
}

.tactical-active {
  color: #FFFF00;
  background-color: #003300;
}

.tactical-standby {
  color: #666666;
  background-color: transparent;
}
```

### Animation Patterns
- Subtle pulsing for active systems
- Military-style transition effects
- Status change animations
- Alert notifications

## Command Integration

### Voice Commands (Future)
- Military phonetic alphabet support
- Command acknowledgment system
- Status report automation
- Emergency override commands

### Tactical Features
- Grid reference system
- Threat assessment display
- Mission parameter tracking
- Unit coordination tools

## Visual Regression Testing

### Military Standards Compliance
1. Command hierarchy display
2. Status indicator accuracy
3. Grid alignment precision
4. Color coding consistency
5. Text formatting standards

### Operational Requirements
- Clear command structure
- Accurate status reporting
- Consistent terminology usage
- Proper rank designation display

This specification ensures the Tactical Command theme provides a professional military interface while maintaining full game functionality and accessibility standards.