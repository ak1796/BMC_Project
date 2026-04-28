const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
const officerRoutes = require('./routes/officer.routes');


const app = express();
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors());
app.use(express.json());

// Initial health check removed to favor static/wildcard serving

app.use('/api/auth', authRoutes);
app.use('/api/shopkeepers', shopkeeperRoutes);
app.use('/api/dustbins', dustbinRoutes);
app.use('/api/wastelogs', wasteRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/officers', officerRoutes);


// Serve Frontend
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    
    // Catch-all middleware to serve the SPA (handles direct navigation/refresh)
    app.use((req, res, next) => {
        // Only serve index.html if it's not an API call
        if (req.url.startsWith('/api')) return next();
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

// Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
