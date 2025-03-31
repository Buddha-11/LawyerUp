const express = require('express');
const functions = require('firebase-functions'); // Import Firebase Functions
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth.route.js');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use('/api', authRoutes);
app.get('/api/hello', (req, res) => {
  res.send('Hello World!');
});

// Remove app.listen since Firebase handles the port internally

// Export the Express app as a Firebase Function
module.exports.app = functions.https.onRequest(app);
