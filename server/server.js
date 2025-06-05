import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import connectDB from './config/mongodb.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';


import formRoutes from './routes/formRoutes.js';
import hackathonRoutes from "./routes/hackathonRoutes.js"
import leaveRoutes from "./routes/leaveRoutes.js"
import idRoutes from './routes/idRoutes.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();


app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'https://rhff.onrender.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));


app.use("/uploads", express.static("uploads"));
app.use("/hackathonuploads", express.static(join(__dirname, "hackathonuploads")));
app.use('/pdfs', express.static(join(__dirname, 'pdfs')));
app.use('/Idpdfs', express.static(join(__dirname, 'Idpdfs')));


app.use('/api/auth', authRouter);
app.use('/api/user', userRouter)


app.use("/api", formRoutes);
app.use("/api", hackathonRoutes);
app.use("/api", leaveRoutes);
app.use("/api", idRoutes);


app.get('/', (req, res) => {
  res.send('API WORKING!!');
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
