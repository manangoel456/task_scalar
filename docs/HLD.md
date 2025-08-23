# High-Level Design (HLD)

## 1. Architecture Diagram

```mermaid
graph TD
    UserInterface[Frontend (React.js)] -->|HTTP/REST| BackendAPI(Backend API - Express.js)
    BackendAPI -->|MongoDB Driver| Database[MongoDB]
    BackendAPI -->|WebSocket| WebSocketServer(WebSocket Server - ws)
    WebSocketServer -->|Real-time Updates| UserInterface
```

## 2. Major Components

*   **Frontend (React.js):**
    *   **Auth Module:** Handles user registration, login, and session management (JWT).
    *   **Pages:** `HomePage`, `LoginPage`, `RegisterPage`, `BoardsHome`, `BoardView`.
    *   **Components:** Reusable UI elements like `Card`, `List`, `BoardHeader`, `ActivitySidebar`, `CardDetailsModal`.
    *   **Services:** Axios-based modules for interacting with the backend REST APIs.
    *   **Context/State Management:** React Context API (or Redux/Zustand if complexity grows) for global state, including user authentication and board data.
    *   **WebSocket Client:** Connects to the WebSocket server for real-time updates.
*   **Backend (Node.js/Express.js):**
    *   **API Endpoints:** RESTful APIs for Users, Workspaces, Boards, Lists, Cards, Comments, and Activity Log.
    *   **Authentication Middleware (`auth.js`):** Verifies JWT tokens for protected routes.
    *   **Models (Mongoose):** Defines the schema and interacts with MongoDB for each entity.
    *   **WebSocket Server (`socket.js`):** Manages WebSocket connections and broadcasts real-time events to relevant clients.
    *   **Error Handling:** Consistent error responses for API failures.
*   **Database (MongoDB):**
    *   Stores all application data: users, workspaces, boards, lists, cards, comments, and activity logs.
    *   NoSQL document database, providing flexibility for schema evolution.

## 3. Data Flow

1.  **User Authentication:**
    *   Frontend sends `POST /api/users/register` or `POST /api/users/login` with credentials.
    *   Backend validates, hashes password (for register), generates JWT, and sends it back.
    *   Frontend stores JWT (e.g., in local storage) and includes it in `x-auth-token` header for subsequent requests.
2.  **Data Retrieval (e.g., Get Boards):**
    *   Frontend sends `GET /api/boards/workspace/:workspaceId` with JWT.
    *   Backend `auth` middleware verifies JWT.
    *   Backend queries MongoDB for boards associated with the user and workspace.
    *   Backend sends board data to the frontend.
3.  **Data Modification (e.g., Move Card):**
    *   Frontend sends `PUT /api/cards/:id/move` with card ID, new list ID, and new position.
    *   Backend validates request and updates card in MongoDB.
    *   Backend uses WebSocket server to `broadcast` a `CARD_MOVED` event to all connected clients viewing the same board.
    *   Frontend receives WebSocket event and updates its local state to reflect the change.

## 4. Real-Time Choice (WebSockets)

*   **Choice:** WebSockets (`ws` library on backend, `socket.io-client` on frontend for simplicity and robustness, though `ws` can be used directly on frontend too).
*   **Rationale:** WebSockets provide a persistent, full-duplex communication channel between the client and server. This is ideal for real-time collaboration features where immediate updates are crucial (e.g., card moves, new comments appearing instantly for all users on a board). Server-Sent Events (SSE) could be an alternative for one-way updates, but WebSockets offer bidirectional communication necessary for more complex real-time interactions (e.g., presence, live typing indicators, if implemented as bonus features).

## 5. Deployment Sketch

*   **Frontend:** Can be deployed on static hosting services like Vercel or Netlify.
*   **Backend:** Can be deployed on cloud platforms like Render, Railway, or Fly.io, which support Node.js applications and can connect to a managed MongoDB service (e.g., MongoDB Atlas).
*   **MongoDB:** A managed cloud database service (e.g., MongoDB Atlas) is recommended for production to ensure scalability, reliability, and ease of management.
