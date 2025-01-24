
import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import User from '../Model/userModel.js';
// import dotenv from 'dotenv';
// dotenv.config();

const isAuthenticated = catchAsync(async(req, res, next) =>{


    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return next(new AppError('You are not logged in. Please log in to access', 401));
        console.log(process.env.JWT_SECRETE)
    }
     console.log(process.env.JWT_SECRETE)
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next( new AppError("The user belonging to this token does not exist!", 401));
    }

    req.user = currentUser;
    next();
});

export default isAuthenticated;