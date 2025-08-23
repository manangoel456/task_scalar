const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const cors = require('cors');
const { initializeWebSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Initialize WebSocket Server
initializeWebSocket(server);

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/workspaces', require('./routes/api/workspaces'));
app.use('/api/boards', require('./routes/api/boards'));
app.use('/api/lists', require('./routes/api/lists'));
app.use('/api/cards', require('./routes/api/cards'));
app.use('/api/comments', require('./routes/api/comments'));
app.use('/api/activities', require('./routes/api/activities'));
app.use('/api/invitations', require('./routes/api/invitations'));
app.use('/api/comments', require('./routes/api/comments'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));