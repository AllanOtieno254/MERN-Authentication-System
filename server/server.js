// install these: npm i express cors dotenv nodemon jsonwebtoken mongoose bcryptjs nodemailer cookie-parser

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

//connecting with mongodb from config file
connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000']; //'https://your-production-domain.com' can be added here for production

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

//API ENDPOINTS
app.get('/', (req, res) => {
    res.send('API Working');
});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});