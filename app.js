import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import globalErrorHandler from "./Controller/errorController.js";
import signUp from './Routes/singUp.js';
import AppError from "./Utils/appError.js";
import swaggerUi from 'swagger-ui-express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cookieParser());
app.use(
    cors({
        origin: ["https://email-frontend-kappa.vercel.app", "http://localhost:9030"],
        credentials: true,
    })
);


const swaggerPath = path.join(__dirname, 'swagger.json');
const swaggerDocs = JSON.parse(await readFile(swaggerPath, 'utf-8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json({limit: "10kb"}));
// user apis

app.use('/api/v1/users', signUp);

app.all("*", (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});

app.use(globalErrorHandler);

export default app;