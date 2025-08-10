const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // We will create this file next
const predictRouter = require('./routes/predict'); 
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests (from React)

// Routes
app.use('/api/auth', authRoutes); // Register the routes for authentication
app.use('/api', predictRouter);
app.use("/api/history", require("./routes/history"));

// Database connection
mongoose.connect('mongodb://localhost:27017/instawild', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
