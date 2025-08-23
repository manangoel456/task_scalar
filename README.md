# Mini-Trello (Kanban) App
Video Demo [LINK](https://drive.google.com/file/d/1LGnaDCN7v4HTENf5-r6hwbS11A3ljAVq/view?usp=sharing)

A lightweight Trello-like Kanban application built with the **MERN stack** and real-time collaboration via WebSockets.

---

## 🧭 Table of Contents
- [Tech Stack and Rationale](#-tech-stack-and-rationale)
- [Setup & Run](#-setup--run)
  - [Prerequisites](#prerequisites)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Schema Overview (ERD)](#-schema-overview-erd)
- [Design Documents](#-design-documents)
- [Real-Time Server](#-real-time-server)
- [Seed Data](#-seed-data)
- [Project Structure](#-project-structure)


---

## 🚀 Tech Stack and Rationale

This project uses the **MERN stack**:

- **MongoDB** → Flexible NoSQL document database that aligns well with JavaScript objects and supports agile schema evolution.
- **Express.js** → Minimal, performant backend framework for REST APIs and WebSocket integration.
- **React.js** → Component-based library for building scalable, interactive single-page applications (SPA).
- **Node.js** → Non-blocking, event-driven runtime ideal for high-throughput APIs and real-time services.

For real-time collaboration, **WebSockets** are used (instead of SSE) to support **bidirectional communication**. This enables instant updates for actions like creating/moving cards, editing titles/descriptions, and adding comments—so all collaborators see changes immediately.

JWT-based authentication used.

---

## ⚙️ Setup & Run

### Prerequisites
- [Node.js (LTS)](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or cloud, e.g., MongoDB Atlas)

### Backend
```bash
cd backend
npm install
npm start
```

The server runs at http://localhost:5000
 (or your configured port).
 ### Frontend
 ```bash
cd frontend
npm install
npm start
```

The client runs at http://localhost:3000


## 📊 Schema Overview (ERD)

A high-level **Entity-Relationship Diagram (ERD)** of the MongoDB collections:

- **Users** → Authentication & profile details  
- **Workspaces** → Containers for multiple boards, owned by users  
- **Boards** → Collaborative spaces that contain lists  
- **Lists** → Ordered collections of cards within a board  
- **Cards** → Core task items (title, description, assignees, comments, attachments)  
- **Comments** → Notes/discussions attached to cards  
- **Activity** → Audit log of actions performed on a board  

![ERD](./docs/erd.png)

---

## 📂 Design Documents

See the `docs` folder for detailed design:

- [docs/HLD.md](./docs/HLD.md) → **High-Level Design** (architecture, data flow, major components)  
- [docs/LLD.md](./docs/LLD.md) → **Low-Level Design** (API specs, database schemas, implementation strategies)  

> 💡 **Tip:** If these files don’t exist yet, create them using the paths above so the links resolve in Git clients and GitHub.

---

## 🔄 Real-Time Server

The **WebSocket server** is integrated directly into the Express.js backend.  
Running:

```bash
npm start
```
in the backend directory starts both the REST API and WebSocket server on the same port.
This keeps deployment simple and avoids cross-origin/socket port mismatch issues.
## 🌱 Seed Data

Populate your database with realistic sample data for quick testing:

1. Ensure **MongoDB** is running and `MONGO_URI` is set in your `.env`.
2. From the project root, run:

```bash
cd backend
node scripts/seed.js
```
## 📁 Project Structure

<img width="217" height="635" alt="image" src="https://github.com/user-attachments/assets/17911633-c522-4dfd-9b55-681851bf88b4" />




