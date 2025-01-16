# Rich Text and Code Formatting System

[Previous content remains the same...]

## Client Implementation Plan

### 1. Message Input Enhancement
```typescript
// Location: client/src/components/common/RichTextEditor.tsx
```
- [ ] Configure TipTap editor with basic extensions
  - StarterKit for basic formatting
  - CodeBlock with language selection
  - Mention extension for @user and #channel
  - Link extension with validation
- [ ] Add toolbar for formatting options
- [ ] Implement keyboard shortcuts
- [ ] Add placeholder and focus styles
- [ ] Handle message submission

### 2. Message Display Component
```typescript
// Location: client/src/components/message/MessageView.tsx
```
- [ ] Create read-only TipTap instance
- [ ] Configure view-only extensions
- [ ] Handle message content parsing
- [ ] Implement theme-aware styling
- [ ] Add loading states

### 3. Code Block Enhancement
```typescript
// Location: client/src/components/message/CodeBlock.tsx
```
- [ ] Create custom TipTap extension for code blocks
- [ ] Integrate Prism.js for syntax highlighting
- [ ] Add copy button functionality
- [ ] Implement language detection
- [ ] Style for light/dark themes

### 4. Mention System
```typescript
// Location: client/src/components/message/MentionList.tsx
```
- [ ] Create mention suggestion component
- [ ] Implement mention popup positioning
- [ ] Add keyboard navigation
- [ ] Handle mention selection
- [ ] Style mention suggestions

### 5. Store Updates
```typescript
// Location: client/src/stores/message.store.ts
```
- [ ] Add message formatting state
- [ ] Handle mention tracking
- [ ] Manage code block metadata
- [ ] Cache parsed content

### 6. Types and Utilities
```typescript
// Location: client/src/types/message.types.ts
```
- [ ] Define message format types
- [ ] Create parsing utilities
- [ ] Add validation helpers
- [ ] Define render helpers

### Implementation Order:

1. **Basic Editor Setup** (2-3 days)
   - Configure TipTap
   - Basic styling
   - Message submission
   - Simple display

2. **Code Block Support** (2-3 days)
   - Syntax highlighting
   - Copy functionality
   - Theme support
   - Language detection

3. **Mention System** (2-3 days)
   - Suggestion popup
   - Mention tracking
   - Keyboard navigation
   - Styling

4. **Polish & Performance** (2-3 days)
   - Caching
   - Loading states
   - Error handling
   - Performance optimization

### Required Changes to Existing Components:

1. **MessageInput.tsx**
   - Replace current input with RichTextEditor
   - Update message submission logic
   - Add formatting handlers

2. **MessageItem.tsx**
   - Replace content rendering with MessageView
   - Update styling for rich content
   - Add interaction handlers

3. **MessageList.tsx**
   - Add virtualization for performance
   - Update message rendering
   - Handle loading states

4. **Channel.tsx**
   - Update message handling
   - Add mention resolution
   - Update scroll behavior

### New Files to Create:

```
client/src/
├── components/
│   ├── common/
│   │   ├── RichTextEditor.tsx       // Main editor component
│   │   └── RichTextToolbar.tsx      // Formatting toolbar
│   ├── message/
│   │   ├── MessageView.tsx          // Read-only message display
│   │   ├── CodeBlock.tsx            // Code block component
│   │   └── MentionList.tsx          // Mention suggestions
│   └── editor/
│       ├── extensions/              // Custom TipTap extensions
│       │   ├── codeBlock.ts
│       │   └── mention.ts
│       └── utils/                   // Editor utilities
│           ├── formatting.ts
│           └── parsing.ts
├── types/
│   └── message.types.ts             // Enhanced message types
└── utils/
    ├── syntax-highlight.ts          // Code highlighting
    └── mention-utils.ts             // Mention handling
```

### Testing Plan:

1. **Unit Tests**
   - Message parsing
   - Code block handling
   - Mention detection
   - Keyboard shortcuts

2. **Component Tests**
   - Editor functionality
   - Message rendering
   - Code block interaction
   - Mention suggestions

3. **Integration Tests**
   - Full message flow
   - Theme switching
   - Performance testing

Would you like to start with any specific component or discuss the implementation details further? 