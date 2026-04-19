const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const shopkeeperRoutes = require('./routes/shopkeeper.routes');
const dustbinRoutes = require('./routes/dustbin.routes');
const wasteRoutes = require('./routes/waste.routes');
const alertRoutes = require('./routes/alert.routes');
const fineRoutes = require('./routes/fine.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');


const app = express();
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// Main entry point for routes
app.get('/', (req, res) => {
    res.send('Smart Waste Management API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/shopkeepers', shopkeeperRoutes);
app.use('/api/dustbins', dustbinRoutes);
app.use('/api/wastelogs', wasteRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/payment', paymentRoutes);


// Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
