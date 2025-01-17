**Below is a high-level, detailed plan** describing how to implement the server (@server) so that it fully supports the existing client (@client) codebase, based on the reviewed snippets and the database schema. This plan assumes:

- We are not creating new feature branches or pull requests; all changes go directly into main.  
- Only OpenAPI-driven tests will be used for validation.  
- We do not support mentions in this implementation (the client code occasionally references them, but we will skip server-side mention logic).  

---

## 1. User & Auth Implementation

1. **User Table & Queries**  
   - Ensure the database has a “users” table, with fields matching the client’s user store expectation:  
     • id, email, password, username, role, createdAt, updatedAt, deletedAt
   - Confirm or add DB queries for:  
     • Create a user (registration).  
     • Find user by email (for login).  
     • Find user by id (for session validation).  
     • Update user’s status (online/offline).  

2. **Auth Routes**  
   - Maintain existing routes (register/login/logout) per the client’s use of the “auth” store.  
   - Return user data (excluding password) to the client upon successful registration or login.  
   - Provide an /auth/me endpoint to get the currently logged-in user’s profile.  
   - Validate credentials on login, hashing for new registrations.  

3. **OpenAPI Definitions**  
   - In your OpenAPI spec (e.g., openapi.yaml or JS-based config), define request/response schemas for:  
     • POST /auth/register  
     • POST /auth/login  
     • GET /auth/me  
   - Include validation rules for email/password formats if desired.  

---

## 2. Channel Management

1. **Channels Table & Queries**  
   - Confirm the “channels” table exists with at least:  
     • id, name, description, isPrivate, createdAt, updatedAt, archivedAt
   - Create or refine queries for reading channels, creating channels (if needed), updating them, etc.  

2. **Channel API Endpoints**  
   - GET /channels: Returns a list of channels to populate the client’s ChannelList component.  
   - GET /channels/:id: Returns a single channel’s info (the client may or may not call this explicitly).  
   - If channel creation is needed from the client side, expose a POST /channels.  

3. **Data Loading**  
   - The client typically loads a user’s channel list after authentication is confirmed. Make sure the route can handle a user-based filter or simply return all channels if that’s acceptable in your environment.  

4. **OpenAPI**  
   - In the spec, define the Channel schema and the requests/responses for channel endpoints.  

---

## 3. Messages & Threads

1. **Messages Table & Queries**  
   - A “messages” table with:  
     • id, channelId, userId, content, createdAt, updatedAt, deletedAt
   - Possibly a “threads” relationship or a self-reference in “messages” if threads are contained in the same table.  

2. **Thread Support**  
   - The client displays a “main” message list and can open a “MessageThread” side panel.  
   - If the app wants true separate threads, consider a “threadId” column in messages, or simply store a reference to the parent message.  
   - Support queries to fetch all messages in the main channel, plus thread messages separately.  

3. **Message CRUD Endpoints**  
   - GET /channels/:channelId/messages: Retrieve the main message list.  
   - GET /threads/:threadId: Retrieve messages for a specific thread.  
   - POST /channels/:channelId/messages: Create a new message.  
   - Optionally, endpoints for editing/deleting a message if the client’s “edit / delete” features are used.  

4. **OpenAPI**  
   - Define the “Message” schema.  
   - Document each message route in the spec.  

---

## 4. Searching

1. **Client-Side Search**  
   - The client’s SearchInput and related components dispatch a “searchMessages” call, presumably to an endpoint.  
   - They also support filters like channel:name, user:@name, has:thread, etc.  

2. **Server API**  
   - A single GET /search or POST /search endpoint might need to parse query parameters or filter objects.  
   - Implement text search across messages. At a minimum:  
     • If channel is specified, restrict queries to that channel.  
     • If user is specified, filter by userId.  
     • If date filters or “has:thread” are used, handle these selectively.  

3. **OpenAPI**  
   - Document a minimal search response schema listing all matching messages.  
   - Specify how the input parameters are provided (e.g., GET query string, or POST body containing filters).  

---

## 5. Real-time or Polling Model (Optional)

1. **Current Client Approach**  
   - The client code does not show explicit references to websockets or real-time endpoints (besides a minimal mention of WebSocket in some older snippet).  
   - If real-time is needed, you can integrate websockets or server-sent events. If not, the client might just re-poll or rely on manual refresh.  

2. **Implementation**  
   - Add real-time or keep using “fetch from server.” This depends on the usage pattern in the client.  

---

## 6. Additional Considerations

1. **User Presence & Typing Indicators**  
   - The client references “typingUsers,” “onlineUsers,” etc. You can handle these states with:  
     • WebSockets, or  
     • Timed updates in the DB or session.  
   - If real-time is not implemented, you can skip the presence pieces or reduce them to no-ops.  

2. **Security & Validation**  
   - Use OpenAPI’s request/response validation.  
   - Ensure queries are parameterized to avoid SQL injection.  
   - Add rate limiting on crucial endpoints (already partly done in the config).  

3. **Logging & Error Handling**  
   - The client expects JSON errors with status codes. Ensure your Express error handlers return errors in a consistent JSON format.  

4. **Deployment & Environment**  
   - Make sure .env variables (like DB credentials) are properly set in your environment.  
   - The client .env references “VITE_API_URL.” Confirm that your server is accessible at that or a proxied route.  

---

## 7. Testing & Verification

1. **OpenAPI Testing**  
   - Use express-openapi-validator or a similar tool to run validations on each route.  
   - Confirm that endpoints match the spec’s input and output schemas (e.g., correct fields in JSON).  

2. **Manual Client Check**  
   - Start the server, run the client, and manually confirm the user can:  
     • Log in/out, register.  
     • See channel lists.  
     • Post messages, see them rendered.  
     • Start/reply to threads.  
     • Perform basic searches.  

3. **Security & Edge Cases**  
   - Try invalid logins, user search queries, or large message payloads.  
   - Ensure helpful error messages flow back to the UI.  

---

### Conclusion

Following these steps will create a robust, server-side feature set that satisfies the client’s main UI flows around channels, messages, threads, user authentication, and search. By carefully documenting and validating each endpoint with OpenAPI, you can ensure compatibility with the client application while minimizing manual test overhead. Remember that mention logic is omitted in this plan, per your request. If you have any questions or refinements before we finalize, let me know!
