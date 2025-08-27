# Context Mapper Agent Specification

## Agent Name: `context-mapper`

**Purpose**: Maintain contextual documentation in every folder and provide intelligent file discovery for development tasks.

---

## Core Capabilities

### 1. Context Documentation Management
- Create/maintain `CONTEXT.md` files in every folder
- Auto-generate folder summaries with file purposes and relationships
- Track file dependencies and cross-references
- Update documentation when files change

### 2. Intelligent File Discovery
- Analyze task requirements and map to relevant files/folders
- Provide targeted file lists instead of full codebase exploration
- Understand code relationships and dependencies
- Filter irrelevant files for specific tasks

### 3. Knowledge Base Integration
- Store analysis results in `.claude/knowledge/` directory
- Create searchable index of codebase structure
- Maintain change logs and relationship maps

---

## Implementation Plan

### Phase 1: Agent Creation
- Define specialized agent with tools: Read, Write, Edit, Glob, LS, Grep, Task
- Create agent prompt focusing on contextual analysis and documentation
- Implement folder analysis algorithms

### Phase 2: Context Documentation System
- Scan entire `src/` directory structure
- Generate `CONTEXT.md` for each folder explaining:
  - Purpose of folder and its files
  - Key classes/functions and their responsibilities  
  - Dependencies and relationships
  - Integration points with other systems

### Phase 3: Intelligent Discovery Engine
- Build file relationship mapping system
- Create task-to-files matching algorithm
- Implement relevance scoring for file selection
- Generate focused file lists for development tasks

### Phase 4: Knowledge Management
- Create persistent knowledge base in `.claude/knowledge/`
- Implement change tracking and update mechanisms
- Build searchable index for quick file discovery

---

## Agent Tools & Capabilities

The context-mapper agent will have access to:
- **Read**: Analyze existing files and understand code structure
- **Write/Edit**: Create and maintain CONTEXT.md files
- **Glob/LS**: Scan directory structures efficiently
- **Grep**: Search for patterns and relationships across files
- **Task**: Delegate specialized analysis tasks

---

## Context Documentation Format

Each `CONTEXT.md` file will contain:

```markdown
# Folder Context: [folder_name]

## Purpose
Brief description of what this folder contains and its role in the system.

## Key Files
- `file1.js` - Description of purpose and main functionality
- `file2.js` - Description of purpose and main functionality

## Dependencies
- Internal: Other folders/files this depends on
- External: Libraries or systems used

## Integration Points
How this folder connects to other parts of the system.

## Last Updated
Timestamp and change summary
```

---

## Intelligent Discovery Workflow

When given a development task:

1. **Task Analysis**: Parse the requirements and identify key concepts
2. **Relevance Mapping**: Match concepts to folders/files using context docs
3. **Dependency Resolution**: Include related files based on known relationships
4. **Filtered Results**: Provide focused list of relevant files only
5. **Context Briefing**: Summarize what each file contains related to the task

---

## Expected Benefits

- **Efficiency**: Eliminate need to read irrelevant files during development
- **Context Awareness**: Provide instant context for any folder/file
- **Focused Development**: Speed up tasks by targeting relevant code only
- **Documentation**: Maintain up-to-date folder documentation automatically
- **Navigation**: Enable efficient traversal of large codebases

---

## Integration with Current Codebase

The agent will immediately analyze the abilities system structure:

### Initial Target Areas:
- `src/abilities/` - Complete ability system documentation
- `src/character/skills/` - Skill system integration points
- `src/combat/` - Combat system interactions
- `src/core/` - Core game engine connections

### Workflow Example:
```
Task: "Add new lockpicking abilities"
↓
Context-Mapper Analysis:
- Relevant: src/abilities/exploration/, src/abilities/core/
- Dependencies: src/character/skills/SkillSystem.js
- Integration: src/combat/StatusEffectRegistry.js (for lockpick tools)
- Irrelevant: src/combat/TurnManager.js, src/dungeon/DungeonGenerator.js
↓
Focused File List provided to developer
```

---

## Usage Instructions

### Creating the Agent:
```bash
claude agent create context-mapper --description "Maintains contextual documentation and provides intelligent file discovery"
```

### Invoking for Tasks:
```
# Initial folder documentation
Task: "Create context documentation for all folders in src/"

# File discovery for development
Task: "Find relevant files for implementing crafting system"
```

---

## Maintenance & Updates

The context-mapper will:
- Monitor file changes and update context docs accordingly
- Rebuild relationship maps when significant changes occur  
- Maintain change logs in `.claude/knowledge/changes.log`
- Provide diff summaries when context docs are updated

This ensures the documentation stays current and useful for ongoing development.