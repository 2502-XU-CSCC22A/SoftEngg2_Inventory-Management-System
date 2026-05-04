import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { productsRouter } from "./routes/products.js";
import { transactionsRouter } from './routes/transactions.js';
import { usersRouter } from './routes/users.js';
import { authRouter } from './routes/auth.js';
import { activityLogsRouter } from './routes/activityLogs.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use(session( {
  name: "session_id",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: false, // set true later
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: "/"
  }
}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/products", productsRouter);
app.use("/transactions", transactionsRouter); 
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/activity-logs', activityLogsRouter);

export default app;

