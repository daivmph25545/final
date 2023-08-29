import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from 'cors';
import connectDB from "./config/database";

import authRouter from "./routes/auth";
import passwordRouter from "./routes/password";
const app = express();

dotenv.config();

// connect db
connectDB(process.env.MONGO_URI)

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors())

app.use('/auth', authRouter)
app.use('/password', passwordRouter)
export const viteNodeApp = app;
