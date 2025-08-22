# Context7 Training Guide for Development Team

## Overview
Context7 is Claude Code's documentation lookup system that provides instant access to up-to-date library documentation, code examples, and best practices. This training ensures our team uses it effectively for faster development.

## Core Principle: Use More Rather Than Less
**Team Policy**: When in doubt, use Context7. It's better to over-utilize than miss opportunities for faster, better-informed development.

## What is Context7?

Context7 is a documentation retrieval system that:
- Provides real-time access to library documentation
- Offers code examples and implementation patterns
- Reduces context switching from IDE to browser
- Ensures you're using current best practices
- Speeds up development by eliminating documentation hunting

## When to Use Context7

### ✅ Always Use For:
1. **New Library Integration**: Before adding any dependency
2. **API Implementation**: When working with external APIs
3. **Framework Features**: React hooks, Node.js modules, etc.
4. **Troubleshooting**: When encountering library-specific errors
5. **Best Practices**: Before implementing complex patterns
6. **Version Updates**: When upgrading dependencies

### ✅ Our Project Specific Use Cases:
- **Hathora SDK**: Lobby management, matchmaking, WebSocket handling
- **Playwright**: Visual testing, browser automation
- **WebSocket APIs**: Real-time communication patterns
- **TypeScript**: Advanced type patterns, configuration
- **Node.js**: Server architecture, performance optimization
- **React**: Component patterns, state management
- **Testing Libraries**: Jest, testing best practices

## How to Use Context7

### Step 1: Resolve Library ID
```javascript
// In Claude Code, use this pattern:
mcp__context7__resolve-library-id: { libraryName: "hathora" }
```

### Step 2: Get Documentation
```javascript
// Use the resolved ID to get docs:
mcp__context7__get-library-docs: { 
  context7CompatibleLibraryID: "/hathora/server-sdk",
  topic: "lobby-management",  // Optional: focus area
  tokens: 15000  // Optional: amount of docs to retrieve
}
```

## Practical Examples for Our Project

### Example 1: Hathora Integration
**Scenario**: Implementing lobby creation
```
Developer Question: "How do I create a lobby with custom configuration?"

Context7 Usage:
1. resolve-library-id: "hathora"
2. get-library-docs: "/hathora/server-sdk", topic: "lobby-creation"
3. Get instant examples and best practices
```

### Example 2: Playwright Testing
**Scenario**: Setting up visual regression tests
```
Developer Question: "What's the best way to handle screenshot comparisons?"

Context7 Usage:
1. resolve-library-id: "playwright"
2. get-library-docs: "/microsoft/playwright", topic: "visual-testing"
3. Access latest testing patterns and configurations
```

### Example 3: WebSocket Implementation
**Scenario**: Optimizing real-time communication
```
Developer Question: "How should I handle WebSocket reconnection?"

Context7 Usage:
1. resolve-library-id: "ws"
2. get-library-docs: "/websockets/ws", topic: "reconnection"
3. Get production-ready reconnection strategies
```

## Team Training Workflow

### Phase 1: Understanding (This Week)
Each developer must:
1. Read this training guide
2. Practice with 3 Context7 lookups
3. Confirm understanding with examples

### Phase 2: Integration (Next Week)
Each developer must:
1. Use Context7 for at least one real task
2. Document the experience
3. Share learnings with team

### Phase 3: Adoption (Ongoing)
Team standards:
1. Use Context7 before asking team questions
2. Include Context7 references in code reviews
3. Share useful Context7 discoveries in standups

## Training Assignments by Role

### Backend Developers
**Required Context7 Lookups:**
1. Hathora Server SDK - advanced features
2. Node.js - performance optimization patterns
3. WebSocket - production deployment strategies

### Frontend Developers  
**Required Context7 Lookups:**
1. React - advanced hooks and patterns
2. TypeScript - complex type definitions
3. Browser APIs - real-time communication

### Full-Stack Developers
**Required Context7 Lookups:**
1. Choose 2 from backend list
2. Choose 2 from frontend list
3. Database optimization patterns

## Best Practices

### ✅ Do:
- Use Context7 BEFORE implementing new features
- Search specific topics when possible
- Share useful findings with the team
- Reference Context7 docs in code comments
- Use it for troubleshooting before Stack Overflow

### ❌ Don't:
- Skip Context7 because "I think I know how"
- Use only generic searches - be specific
- Forget to apply the learnings immediately
- Keep useful discoveries to yourself

## Confirmation Requirements

Each team member must complete and confirm:

### 1. Knowledge Check
- [ ] Understand when to use Context7
- [ ] Know how to resolve library IDs
- [ ] Can retrieve focused documentation
- [ ] Understand project-specific use cases

### 2. Practical Demonstration
- [ ] Complete 3 practice lookups
- [ ] Use Context7 for 1 real development task
- [ ] Document one useful discovery

### 3. Team Integration
- [ ] Commit to using Context7 in daily workflow
- [ ] Agree to share discoveries in standups
- [ ] Will reference Context7 in code reviews

## Training Schedule

### Week 1: Foundation
- Monday: All developers read training guide
- Tuesday: Practice sessions with trainer
- Wednesday: Individual practice and Q&A
- Thursday: Real-world application
- Friday: Confirmation and feedback

### Week 2: Integration
- Monday-Friday: Daily Context7 usage tracking
- Friday: Team retrospective on adoption

## Success Metrics

We'll track:
- Context7 usage frequency per developer
- Time saved on documentation hunting
- Quality of implementation (fewer bugs)
- Team knowledge sharing increase
- Overall development velocity improvement

## Support Resources

### Getting Help
1. **Immediate Questions**: Ask in team chat with Context7 tag
2. **Training Issues**: Schedule 1:1 with training coordinator
3. **Technical Problems**: Document and escalate to architecture team

### Reference Materials
- This training guide (always current)
- Context7 command reference (in Claude Code help)
- Team usage examples (growing library)

## Next Steps

1. **Immediate**: All developers acknowledge receipt of training
2. **This Week**: Complete knowledge check and practical demonstration
3. **Ongoing**: Integrate Context7 into daily development workflow

---

**Training Coordinator**: AI Development Manager  
**Training Start Date**: Today  
**Completion Target**: End of next week  
**Review Date**: Monthly team retrospectives  

## Developer Acknowledgment Section

Each developer must confirm by replying with:
- Your name and role
- Completion of knowledge check items
- Commitment to daily Context7 usage
- One specific use case for your current work

**Template Response:**
```
Name: [Developer Name]
Role: [Backend/Frontend/Full-Stack]
Knowledge Check: ✅ Completed
Practice Lookups: ✅ Completed [list 3 libraries looked up]
Real Task: ✅ Used Context7 for [specific task description]
Commitment: ✅ Will use Context7 daily and share discoveries
Current Use Case: [Specific library/feature you'll lookup next]
```