import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import globalErrorHandler from "./Controller/errorController.js";
import signUp from './Routes/singUp.js';
import AppError from "./Utils/appError.js";

const app = express();

app.use(cookieParser());
app.use(
    cors({
        origin:"https://email-frontend-kappa.vercel.app",
        credentials: true
    })
);
app.use(express.json({limit: "10kb"}));
// user apis

app.use('/api/v1/users', signUp);

app.all("*", (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});

app.use(globalErrorHandler);

export default app;