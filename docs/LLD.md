# Low-Level Design (LLD)

## 1. API Definitions

All API endpoints are prefixed with `/api`.

### User Authentication (`/api/users`)

*   `POST /api/users/register`: Register a new user.
    *   **Request Body:** `{ name, email, password }`
    *   **Response:** `{ token }` (JWT)
    *   **Errors:** 400 (User already exists), 500 (Server Error)
*   `POST /api/users/login`: Authenticate user and get JWT.
    *   **Request Body:** `{ email, password }`
    *   **Response:** `{ token }` (JWT)
    *   **Errors:** 400 (Invalid credentials), 500 (Server Error)

### Workspaces (`/api/workspaces`)

*   `POST /api/workspaces`: Create a new workspace.
    *   **Auth:** Required
    *   **Request Body:** `{ name }`
    *   **Response:** `{ workspace }`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)
*   `GET /api/workspaces`: Get all workspaces for the authenticated user.
    *   **Auth:** Required
    *   **Response:** `[workspace1, workspace2, ...]`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)

### Boards (`/api/boards`)

*   `POST /api/boards`: Create a new board.
    *   **Auth:** Required
    *   **Request Body:** `{ title, workspaceId, visibility }`
    *   **Response:** `{ board }`
    *   **Errors:** 401 (Unauthorized), 404 (Workspace not found), 500 (Server Error)
*   `GET /api/boards/workspace/:workspaceId`: Get all boards for a specific workspace.
    *   **Auth:** Required
    *   **Response:** `[board1, board2, ...]`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)

### Lists (`/api/lists`)

*   `POST /api/lists`: Create a new list.
    *   **Auth:** Required
    *   **Request Body:** `{ title, boardId, position }`
    *   **Response:** `{ list }`
    *   **Errors:** 401 (Unauthorized), 404 (Board not found), 500 (Server Error)
*   `GET /api/lists/board/:boardId`: Get all lists for a specific board, ordered by position.
    *   **Auth:** Required
    *   **Response:** `[list1, list2, ...]`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)

### Cards (`/api/cards`)

*   `POST /api/cards`: Create a new card.
    *   **Auth:** Required
    *   **Request Body:** `{ title, description, listId, boardId, assignees, labels, dueDate, position }`
    *   **Response:** `{ card }`
    *   **Errors:** 401 (Unauthorized), 404 (List/Board not found), 500 (Server Error)
*   `PUT /api/cards/:id/move`: Move a card between lists or reorder within a list.
    *   **Auth:** Required
    *   **Request Body:** `{ newListId (optional), newPosition }`
    *   **Response:** `{ updatedCard }`
    *   **Errors:** 401 (Unauthorized), 404 (Card not found), 500 (Server Error)
*   `PUT /api/cards/:id`: Update a card's details.
    *   **Auth:** Required
    *   **Request Body:** `{ title (optional), description (optional), assignees (optional), labels (optional), dueDate (optional) }`
    *   **Response:** `{ updatedCard }`
    *   **Errors:** 401 (Unauthorized), 404 (Card not found), 500 (Server Error)
*   `GET /api/cards/list/:listId`: Get all cards for a specific list, ordered by position.
    *   **Auth:** Required
    *   **Response:** `[card1, card2, ...]`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)

### Comments (`/api/comments`)

*   `POST /api/comments`: Add a comment to a card.
    *   **Auth:** Required
    *   **Request Body:** `{ text, cardId }`
    *   **Response:** `{ comment }`
    *   **Errors:** 401 (Unauthorized), 404 (Card not found), 500 (Server Error)
*   `GET /api/comments/card/:cardId`: Get all comments for a specific card, ordered by creation date.
    *   **Auth:** Required
    *   **Response:** `[comment1, comment2, ...]`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)

### Activity Log (`/api/activities`)

*   `POST /api/activities`: Log an activity (internal use, typically triggered by other API actions).
    *   **Auth:** Required
    *   **Request Body:** `{ boardId, action, cardId (optional), details (optional) }`
    *   **Response:** `{ activity }`
    *   **Errors:** 401 (Unauthorized), 404 (Board not found), 500 (Server Error)
*   `GET /api/activities/board/:boardId`: Get the last 20 activities for a board, ordered by creation date (descending). Populates `user` and `card` fields.
    *   **Auth:** Required
    *   **Response:** `[activity1, activity2, ...]`
    *   **Errors:** 401 (Unauthorized), 500 (Server Error)

## 2. Main Classes/Modules (Backend)

*   `index.js`: Main Express application setup, MongoDB connection, WebSocket server initialization, and route mounting.
*   `models/`: Contains Mongoose schemas for `User`, `Workspace`, `Board`, `List`, `Card`, `Comment`, `Activity`.
*   `middleware/auth.js`: JWT authentication middleware to protect routes.
*   `routes/`: Contains Express router modules for each entity (`users.js`, `workspaces.js`, `boards.js`, `lists.js`, `cards.js`, `comments.js`, `activities.js`).
*   `utils/socket.js`: Manages WebSocket server instance and provides a `broadcast` function for real-time updates.

## 3. DB Schema (Detailed Mongoose Schemas)

(Refer to `backend/models/` directory for detailed Mongoose schemas. The ERD in `README.md` provides a high-level overview.)

## 4. Indexing & Ordering Strategy

*   **Indexing:**
    *   `User.email`: `unique: true` for efficient login and registration.
    *   `Board.workspace`, `Board.members`: For efficient querying of boards by workspace and user membership.
    *   `List.board`: For efficient querying of lists within a board.
    *   `Card.list`, `Card.board`: For efficient querying of cards within a list and board.
    *   `Comment.card`: For efficient querying of comments for a card.
    *   `Activity.board`: For efficient querying of activities for a board.
    *   `Activity.createdAt`: For efficient sorting of activity logs.
*   **Ordering:**
    *   **Lists and Cards:** Use `position` (Number) field with fractional positions (e.g., 1024, 1536, 2048) to allow for flexible reordering without needing to reindex all items on every move. When an item is moved between two existing items, its new position will be the average of the two surrounding items' positions. If an item is moved to the beginning or end, a new position can be calculated by subtracting/adding a fixed value (e.g., 1024).
    *   **Comments and Activity Log:** Ordered by `createdAt` (Date) field in ascending/descending order as appropriate.

## 5. Error Model

*   **Consistent JSON Responses:** All API errors return a JSON object with a `msg` field describing the error.
    *   Example: `{ "msg": "User not authorized" }`
*   **HTTP Status Codes:** Appropriate HTTP status codes are used to indicate the type of error (e.g., 400 for Bad Request, 401 for Unauthorized, 404 for Not Found, 500 for Server Error).
*   **Centralized Error Handling (Implicit):** While not a single centralized error handling middleware, each route `try-catch` block handles errors consistently by logging the error and sending a 500 status with a generic "Server Error" message to prevent leaking sensitive information. More granular error handling could be implemented with custom error classes and a dedicated error middleware.
