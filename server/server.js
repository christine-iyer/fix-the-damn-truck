const express = require('express');
const connectToDB = require('./config/database');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// MongoDB connection
connectToDB();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/service-request', require('./routes/serviceRequest'));
app.use('/api/list', require('./routes/list'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vehicles', require('./routes/vehicle'))


app.get('/api/health', (_, res) => {
  res.json({ message: 'Server is online' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
