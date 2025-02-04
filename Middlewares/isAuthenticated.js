
import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import AppError from '../Utils/appError.js';
import User from '../Model/userModel.js';


const isAuthenticated = catchAsync(async(req, res, next) =>{


    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return next(new AppError('This account does not exist😏', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next( new AppError("The user belonging to this token does not exist!", 401));
    }

    req.user = currentUser;
    next();
});

export default isAuthenticated;