import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import auth from './middleware/authMiddleware';
import notesRoutes from './routes/notesRoutes';
// Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);


// Database connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MongoDB URI not found. Please add MONGODB_URI to your .env file.");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB successfully! 🚀");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Simple test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server
try {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} catch (err) {
  if (err instanceof Error) {
    console.error(`Server failed to start: ${err.message}`);
  } else {
    console.error("An unknown error occurred on server startup.");
  }
}

app.get('/api/protected', auth, (req, res) => {
  res.json({ msg: 'You have access to this protected route!' });
});