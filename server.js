require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const students = require('./routes/api/students');
const quizzes = require('./routes/api/quizzes');
const teachers = require('./routes/api/teachers');
const enrollments = require('./routes/api/enrollments');
const pagination = require('./routes/api/pagination');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys');

const connectDB = async () => {
  try {
      await mongoose.connect(db.mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log('MongoDB connected');
  } catch (err) {
      console.error('MongoDB connection error:', err);
  }
};

// Connect DB
connectDB();

// Use Routes
app.use('/api/students', students);
app.use('/api/quizzes', quizzes);
app.use('/api/teachers', teachers);
app.use('/api/enrollments', enrollments);
app.use('/api/pagination', pagination);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
