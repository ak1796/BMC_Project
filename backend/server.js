require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { initFineCron } = require('./utils/fineCron');

// Connect to database
connectDB();

// Initialize Cron Jobs
initFineCron();

const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Attach io to request object (optional, for use in controllers)
app.use((req, res, next) => {
    req.io = io;
    next();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
