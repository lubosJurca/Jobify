import 'express-async-errors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cloudinary from 'cloudinary';

// routers
import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';

// public
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// middlewares
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 5100;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});

app.use('/api/v1/jobs', authenticateUser, jobRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/auth', authRouter);

// -------------------- ERROR HANDLERS ---------------------
app.use('*', (req, res) => {
  res.status(404).send({ msg: 'Not found' });
});

app.use(errorHandlerMiddleware);

try {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`Server is running on PORT ${port}`));
} catch (error) {
  console.log(error);
  process.exit(1);
}
