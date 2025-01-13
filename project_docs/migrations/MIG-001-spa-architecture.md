# Migration Plan: Single Page Architecture

## Overview

Converting ChatGenius to a true single-page application with nested routing and state management.

## Junior Developer Guide

### Key Concepts to Understand

1. **State Management Flow**
   - Zustand stores are like global variables but reactive
   - Each store should handle one concern (messages, users, etc.)
   - Stores can interact with each other using getState()
   - Always update state immutably

2. **Real-time Updates**
   - SSE provides one-way real-time updates from server
   - Updates flow: Server → SSE → Store → Components
   - Components subscribe to stores using hooks
   - Always handle connection errors and reconnection

3. **URL Routing**
   - URLs represent application state
   - Routes can be nested (parent/child relationships)
   - Route parameters are dynamic parts of URLs
   - Use navigate() for programmatic navigation

4. **Error Handling**
   - Always handle async operations with try/catch
   - Use error boundaries for component errors
   - Show user-friendly error messages
   - Implement retry mechanisms where appropriate

### Common Gotchas

1. **State Updates**

   ```typescript
   // ❌ Wrong: Mutating state directly
   set((state) => {
     state.messages.push(newMessage);
     return state;
   });

   // ✅ Correct: Creating new state immutably
   set((state) => ({
     messages: [...state.messages, newMessage]
   }));
   ```

2. **Store Subscriptions**

   ```typescript
   // ❌ Wrong: Not cleaning up subscriptions
   useEffect(() => {
     sseManager.subscribe(channelId);
   }, [channelId]);

   // ✅ Correct: Cleaning up subscriptions
   useEffect(() => {
     sseManager.subscribe(channelId);
     return () => sseManager.unsubscribe(channelId);
   }, [channelId]);
   ```

3. **Error Handling**

   ```typescript
   // ❌ Wrong: Not handling errors
   const sendMessage = async () => {
     await api.sendMessage(message);
   };

   // ✅ Correct: Proper error handling
   const sendMessage = async () => {
     try {
       await api.sendMessage(message);
     } catch (error) {
       handleError(error);
       showUserFriendlyError();
     }
   };
   ```

4. **State Management Transition**

   ```typescript
   // ❌ Old way: Using React state
   const [messages, setMessages] = useState<Message[]>([]);
   
   // ✅ New way: Using Zustand
   const messages = useMessageStore(state => state.messages);
   ```

5. **Route Parameter Changes**

   ```typescript
   // ❌ Old way: Query parameters
   const search = window.location.search;
   const params = new URLSearchParams(search);
   const channelId = params.get('channel');
   
   // ✅ New way: Route parameters
   const { channelId } = useParams<{ channelId: string }>();
   ```

6. **API Integration**

   ```typescript
   // ❌ Old way: Direct API calls in components
   useEffect(() => {
     fetch('/api/messages').then(/*...*/);
   }, []);
   
   // ✅ New way: Store handles API calls
   const { fetchMessages } = useMessageStore();
   useEffect(() => {
     fetchMessages();
   }, [fetchMessages]);
   ```

### Development Workflow Tips

1. **Testing Changes**
   - Start with small, isolated changes
   - Test each store method individually
   - Use React DevTools to inspect component updates
   - Use Zustand DevTools to debug state changes

2. **Debugging**
   - Use console.log in store methods to track updates
   - Check Network tab for SSE connection
   - Monitor React component re-renders
   - Use TypeScript to catch type errors early

3. **Performance**
   - Use selective store subscriptions
   - Implement proper memoization
   - Batch related state updates
   - Monitor bundle size

4. **Code Organization**
   - Keep stores in separate files
   - Group related types together
   - Use barrel exports for clean imports
   - Follow consistent naming conventions

## Migration Steps

1. **Phase 1: Foundation**
   - Set up Zustand stores
   - Configure nested routing
   - Implement basic panel layout

2. **Phase 2: Real-time**
   - Implement SSE manager
   - Set up event handling
   - Connect to Zustand stores

3. **Phase 3: UI Migration**
   - Move existing components to new structure
   - Implement panel behaviors
   - Add transitions

4. **Phase 4: Polish**
   - Add loading states
   - Implement error boundaries
   - Add basic caching

## Project Structure Understanding

```typescript
chatgenius/
├── frontend/                 # React SPA code
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── stores/          # Zustand stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and SSE services
│   │   └── types/           # TypeScript definitions
├── server/                   # Backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   └── routes/          # API endpoints
└── db/                      # Database migrations and seeds
    ├── migrations/          # Schema changes
    └── seeds/               # Test data
```

## Technical Considerations

### Browser History

- URL reflects current view state
- Back button navigates through:
  1. Thread -> Channel
  2. Profile -> Previous view
  3. Channel -> Previous channel

### Performance

Initial optimizations:

- Lazy loading for panels
- Basic message caching
- Route-based code splitting

Future optimizations:

- Message virtualization
- Advanced caching
- Image optimization

### Caching Strategy

Initial implementation:

- In-memory message cache
- Session-based user profile cache
- Channel list cache

## Testing Requirements

1. **Route Testing**
   - Deep linking
   - History navigation
   - State preservation

2. **Panel Testing**
   - Resize behavior
   - Collapse/expand
   - Content overflow

3. **State Testing**
   - Real-time updates
   - Cache invalidation
   - State persistence

## Success Metrics

1. **Performance**
   - Time to interactive
   - Navigation smoothness
   - Memory usage

2. **User Experience**
   - Navigation clarity
   - State preservation
   - Real-time responsiveness

## Key Changes

### 1. URL Structure

**Current:**

```plaintext
/login
/channels
```

**New (Nested Routes):**

```plaintext
/client/:workspace/:channelOrDM
/client/:workspace/:channel/thread/:threadId
/client/:workspace/user/:userId
```

Benefits:

- Clean, bookmarkable URLs
- No page reloads
- Proper browser history support
- Deep linking capability

### 2. Layout Architecture

**Panel Structure:**

1. **Navigation Panel** (Left)
   - Width: 10-25% of viewport (flexible)
   - Content: Channels, DMs, Navigation
   - Not collapsible
   - Min-width: 220px
   - Max-width: 480px

2. **Main Panel** (Center)
   - Width: Flexible
   - Content: Chat messages, input area
   - Not collapsible
   - Min-width: 480px

3. **Detail Panel** (Right)
   - Width: 400px (fixed)
   - Content: Threads, user profiles
   - Collapsible
   - Slides in/out

### 3. State Management with Zustand

**Why Zustand:**

- Lightweight (only 1KB)
- Excellent for real-time updates
- Built-in TypeScript support
- Simple API
- Great dev tools integration

**Store Implementation Examples:**

```typescript
// stores/navigation.ts
interface NavState {
  activeChannel: string | null;
  activeThread: string | null;
  activeProfile: string | null;
  detailPanelOpen: boolean;
}

interface NavActions {
  setActiveChannel: (id: string) => void;
  setActiveThread: (id: string) => void;
  setActiveProfile: (id: string) => void;
  toggleDetailPanel: () => void;
}

export const useNavStore = create<NavState & NavActions>((set) => ({
  activeChannel: null,
  activeThread: null,
  activeProfile: null,
  detailPanelOpen: false,
  
  setActiveChannel: (id) => set({ activeChannel: id, activeThread: null }),
  setActiveThread: (id) => set({ activeThread: id, detailPanelOpen: true }),
  setActiveProfile: (id) => set({ activeProfile: id, detailPanelOpen: true }),
  toggleDetailPanel: () => set((state) => ({ detailPanelOpen: !state.detailPanelOpen }))
}));

// stores/messages.ts
interface MessageState {
  messages: Record<string, Message[]>;
  drafts: Record<string, string>;
  messageCache: Map<string, { data: Message[]; timestamp: number }>;
}

interface MessageActions {
  sendMessage: (channelId: string, content: string) => Promise<void>;
  updateDraft: (channelId: string, content: string) => void;
  cacheMessages: (channelId: string, messages: Message[]) => void;
  invalidateCache: (channelId: string) => void;
}

export const useMessageStore = create<MessageState & MessageActions>((set, get) => ({
  messages: {},
  drafts: {},
  messageCache: new Map(),

  sendMessage: async (channelId, content) => {
    // API call to send message
    // Update local state immediately
    // Handle optimistic updates
  },

  updateDraft: (channelId, content) => 
    set((state) => ({ drafts: { ...state.drafts, [channelId]: content } })),

  cacheMessages: (channelId, messages) => {
    const cache = get().messageCache;
    cache.set(channelId, { data: messages, timestamp: Date.now() });
    set({ messageCache: new Map(cache) });
  },

  invalidateCache: (channelId) => {
    const cache = get().messageCache;
    cache.delete(channelId);
    set({ messageCache: new Map(cache) });
  }
}));

### 4. URL Routing Deep Dive

**URL Pattern Examples:**
```typescript
// Example URLs and their meanings:
/client/workspace123/channel-general
  → General channel view
/client/workspace123/channel-general/thread/thread456
  → Thread view in general channel
/client/workspace123/dm-user789
  → Direct message view
/client/workspace123/user/user789
  → User profile view

// Route Parameters Usage:
interface RouteParams {
  workspace: string;
  channelId: string;
  threadId?: string;
  userId?: string;
}

// Component Example:
function ChannelView() {
  const { workspace, channelId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { messages } = useMessageStore();
  const { setActiveChannel } = useNavStore();

  useEffect(() => {
    setActiveChannel(channelId);
    // Load channel data
    // Subscribe to real-time updates
  }, [channelId]);

  const openThread = (threadId: string) => {
    navigate(`/client/${workspace}/${channelId}/thread/${threadId}`);
  };

  return (/* Channel UI */);
}
```

### 5. Real-time System Architecture

**SSE Manager Implementation:**

```typescript
// services/sse.ts
class SSEManager {
  private connection: EventSource | null = null;
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect() {
    try {
      const token = await getAuthToken();
      this.connection = new EventSource(`/api/events?token=${token}`);
      
      this.connection.onopen = () => {
        this.reconnectAttempts = 0;
        useRealtimeStore.getState().setConnected(true);
        this.resubscribeAll();
      };

      this.connection.onerror = (error) => {
        console.error('SSE error:', error);
        this.handleDisconnect();
      };

      this.setupEventListeners();
    } catch (error) {
      console.error('SSE connection error:', error);
      this.handleDisconnect();
    }
  }

  private setupEventListeners() {
    if (!this.connection) return;

    this.connection.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.routeEvent(data);
    });

    // Specific event types
    this.connection.addEventListener('typing', (event) => {
      const { channelId, userId } = JSON.parse(event.data);
      useRealtimeStore.getState().updateTyping(channelId, userId);
    });

    this.connection.addEventListener('presence', (event) => {
      const { userId, status } = JSON.parse(event.data);
      useRealtimeStore.getState().updatePresence(userId, status);
    });
  }

  private routeEvent(event: ServerEvent) {
    switch (event.type) {
      case 'NEW_MESSAGE':
        useMessageStore.getState().addMessage(event.channelId, event.message);
        break;
      case 'MESSAGE_UPDATE':
        useMessageStore.getState().updateMessage(event.channelId, event.message);
        break;
      case 'CHANNEL_UPDATE':
        useChannelStore.getState().updateChannel(event.channel);
        break;
      // ... handle other event types
    }
  }

  private handleDisconnect() {
    useRealtimeStore.getState().setConnected(false);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    }
  }

  subscribe(channelId: string) {
    this.subscriptions.add(channelId);
    // Notify server about new subscription
    fetch(`/api/channels/${channelId}/subscribe`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
  }

  private async resubscribeAll() {
    for (const channelId of this.subscriptions) {
      await this.subscribe(channelId);
    }
  }
}

export const sseManager = new SSEManager();
```

**Real-time Store Implementation:**

```typescript
interface RealtimeState {
  connected: boolean;
  typingUsers: Record<string, Set<string>>;
  presence: Record<string, UserPresence>;
}

interface RealtimeActions {
  setConnected: (status: boolean) => void;
  updateTyping: (channelId: string, userId: string) => void;
  updatePresence: (userId: string, status: PresenceStatus) => void;
}

export const useRealtimeStore = create<RealtimeState & RealtimeActions>((set) => ({
  connected: false,
  typingUsers: {},
  presence: {},

  setConnected: (status) => set({ connected: status }),

  updateTyping: (channelId, userId) => set((state) => {
    const channelTyping = new Set(state.typingUsers[channelId] || []);
    channelTyping.add(userId);
    
    // Clear typing indicator after delay
    setTimeout(() => {
      channelTyping.delete(userId);
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [channelId]: channelTyping
        }
      }));
    }, 3000);

    return {
      typingUsers: {
        ...state.typingUsers,
        [channelId]: channelTyping
      }
    };
  }),

  updatePresence: (userId, status) => set((state) => ({
    presence: {
      ...state.presence,
      [userId]: status
    }
  }))
}));
```

## System Interactions

### Store-to-Store Communication

```typescript
// Example: Message interactions affecting navigation
interface MessageState {
  // ... existing state ...
  openThread: (channelId: string, threadId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  // ... existing implementation ...
  openThread: (channelId: string, threadId: string) => {
    // Update message store
    set((state) => ({
      activeThread: threadId
    }));
    
    // Interact with navigation store
    useNavStore.getState().setActiveThread(threadId);
    
    // Update URL via React Router
    const workspace = useWorkspaceStore.getState().activeWorkspace;
    navigate(`/client/${workspace}/${channelId}/thread/${threadId}`);
  }
}));

// Example: Real-time updates affecting multiple stores
sseManager.on('message_reaction', (event: ReactionEvent) => {
  // Update message store
  useMessageStore.getState().updateReaction(event.messageId, event.reaction);
  
  // Update notification store if needed
  if (event.userId !== currentUserId) {
    useNotificationStore.getState().addNotification({
      type: 'reaction',
      messageId: event.messageId,
      userId: event.userId
    });
  }
});
```

### Component Integration Example

```typescript
function ChannelView() {
  // Combine multiple stores
  const { messages, sendMessage } = useMessageStore();
  const { activeChannel } = useNavStore();
  const { connected } = useRealtimeStore();
  const { currentUser } = useAuthStore();

  // Subscribe to real-time updates
  useEffect(() => {
    if (activeChannel) {
      sseManager.subscribe(activeChannel);
      return () => sseManager.unsubscribe(activeChannel);
    }
  }, [activeChannel]);

  // Handle offline state
  if (!connected) {
    return <OfflineIndicator />;
  }

  return (
    <div>
      <MessageList 
        messages={messages[activeChannel] || []}
        currentUser={currentUser}
      />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

## Error Handling Examples

### 1. Store Error Handling

```typescript
interface MessageState {
  error: Error | null;
  loading: boolean;
}

export const useMessageStore = create<MessageState>((set) => ({
  error: null,
  loading: false,

  sendMessage: async (channelId: string, content: string) => {
    try {
      set({ loading: true, error: null });
      
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: [...(state.messages[channelId] || []), 
            { id: tempId, content, pending: true }]
        }
      }));

      const response = await api.sendMessage(channelId, content);
      
      // Replace temp message with real one
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: state.messages[channelId].map(msg => 
            msg.id === tempId ? response.data : msg
          )
        }
      }));
    } catch (error) {
      set({ error: error as Error });
      
      // Revert optimistic update
      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: state.messages[channelId].filter(msg => msg.id !== tempId)
        }
      }));
    } finally {
      set({ loading: false });
    }
  }
}));
```

### 2. Real-time Error Recovery

```typescript
class SSEManager {
  // ... existing implementation ...

  private async handleDisconnect(error: Error) {
    const realtimeStore = useRealtimeStore.getState();
    realtimeStore.setConnected(false);
    realtimeStore.setError(error);

    // Log error for monitoring
    logger.error('SSE disconnected', { 
      error, 
      reconnectAttempt: this.reconnectAttempts 
    });

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      realtimeStore.setReconnecting(true);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await this.connect();
      } catch (error) {
        this.handleDisconnect(error as Error);
      }
    } else {
      realtimeStore.setFatalError(new Error('Max reconnection attempts reached'));
    }
  }
}
```

### 3. Component Error Boundaries

```typescript
class ChatErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Component error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

## Additional TypeScript Types

```typescript
// Core Types
type MessageType = 'text' | 'system' | 'file' | 'thread_reply';
type UserStatus = 'online' | 'away' | 'offline' | 'dnd';
type PanelType = 'navigation' | 'main' | 'detail';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  lastSeen?: Date;
}

interface Message {
  id: string;
  content: string;
  type: MessageType;
  userId: string;
  channelId: string;
  threadId?: string;
  createdAt: Date;
  updatedAt?: Date;
  reactions?: MessageReaction[];
  attachments?: Attachment[];
  pending?: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  members: string[];
  lastMessage?: Message;
  unreadCount: number;
}

// Event Types
interface BaseEvent {
  type: string;
  timestamp: number;
}

interface MessageEvent extends BaseEvent {
  type: 'NEW_MESSAGE' | 'MESSAGE_UPDATE' | 'MESSAGE_DELETE';
  channelId: string;
  message: Message;
}

interface PresenceEvent extends BaseEvent {
  type: 'PRESENCE_UPDATE';
  userId: string;
  status: UserStatus;
}

interface TypingEvent extends BaseEvent {
  type: 'TYPING';
  channelId: string;
  userId: string;
}

type ServerEvent = MessageEvent | PresenceEvent | TypingEvent;

// Store Types
interface StoreError {
  code: string;
  message: string;
  details?: unknown;
}

interface LoadingState {
  loading: boolean;
  error: StoreError | null;
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    hasMore?: boolean;
  };
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### 6. Debugging Tips

1. **Store Debugging**

   ```typescript
   // Add middleware to log all state changes
   const logMiddleware = (config) => (set, get, api) =>
     config(
       (...args) => {
         console.log('  applying', args);
         set(...args);
         console.log('  new state', get());
       },
       get,
       api
     );

   const useStore = create(
     logMiddleware((set) => ({
       // your store here
     }))
   );
   ```

2. **Network Debugging**

   ```typescript
   // Add request/response logging
   async function apiCall() {
     console.group('API Call');
     console.time('Duration');
     try {
       const response = await fetch('/api/data');
       console.log('Response:', response);
       console.timeEnd('Duration');
     } catch (error) {
       console.error('Error:', error);
     }
     console.groupEnd();
   }
   ```

3. **Real-time Debugging**

   ```typescript
   // Add SSE event logging
   sseManager.on('message', (event) => {
     console.group('SSE Event');
     console.log('Type:', event.type);
     console.log('Data:', event.data);
     console.log('Timestamp:', new Date().toISOString());
     console.groupEnd();
   });
   ```

### 7. Testing Strategy

1. **Store Testing**

   ```typescript
   // Example store test
   describe('messageStore', () => {
     beforeEach(() => {
       useMessageStore.setState({ messages: {} });
     });

     it('should add a message', () => {
       const message = { id: '1', content: 'test' };
       useMessageStore.getState().addMessage('channel1', message);
       
       const state = useMessageStore.getState();
       expect(state.messages.channel1).toContain(message);
     });
   });
   ```

2. **Component Testing**

   ```typescript
   // Example component test
   describe('ChannelView', () => {
     it('should subscribe to channel updates', () => {
       const subscribe = jest.spyOn(sseManager, 'subscribe');
       
       render(<ChannelView channelId="123" />);
       
       expect(subscribe).toHaveBeenCalledWith('123');
     });
   });
   ```

### 8. Performance Considerations

1. **Message List Virtualization**

   ```typescript
   import { VirtualizedList } from 'react-window';

   function MessageList({ messages }) {
     return (
       <VirtualizedList
         height={400}
         itemCount={messages.length}
         itemSize={50}
         width="100%"
       >
         {({ index, style }) => (
           <MessageItem
             message={messages[index]}
             style={style}
           />
         )}
       </VirtualizedList>
     );
   }
   ```

2. **Selective Store Updates**

   ```typescript
   // ❌ Subscribing to entire store
   const store = useMessageStore();
   
   // ✅ Subscribing to specific slice
   const messages = useMessageStore(state => state.messages[channelId]);
   ```

3. **Debounced Updates**

   ```typescript
   function MessageInput() {
     const updateDraft = useMessageStore(state => state.updateDraft);
     
     const debouncedUpdate = useMemo(
       () => debounce(updateDraft, 300),
       [updateDraft]
     );
     
     return (
       <input
         onChange={e => debouncedUpdate(e.target.value)}
       />
     );
   }
   ```

### 9. Deployment Considerations

1. **Environment Configuration**

   ```typescript
   // config.ts
   export const config = {
     api: {
       baseUrl: process.env.NEXT_PUBLIC_API_URL,
       timeout: 5000
     },
     sse: {
       reconnectAttempts: 5,
       reconnectDelay: 1000
     }
   };
   ```

2. **Build Process**

   ```bash
   # Build steps
   npm run build        # Build frontend
   npm run test        # Run tests
   npm run typecheck   # Check types
   npm run lint        # Lint code
   
   # Production deployment
   npm run start       # Start production server
   ```

3. **Monitoring Setup**

   ```typescript
   // Add performance monitoring
   import * as Sentry from '@sentry/react';

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
   });

   // Add error tracking
   window.addEventListener('unhandledrejection', (event) => {
     Sentry.captureException(event.reason);
   });
   ```
