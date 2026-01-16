// install these: npm i express cors dotenv nodemon jsonwebtoken mongoose bcryptjs nodemailer cookie-parser

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect DB
connectDB();

// ✅ Allowed origins (LOCAL + VERCEL)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4000',
  'https://mern-authentication-system-jet.vercel.app' // 🔴 REPLACE if Vercel URL changes
];

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Proper CORS setup for cookies
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Health check
app.get('/', (req, res) => {
  res.send('API Working');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
