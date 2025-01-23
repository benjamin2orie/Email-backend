import User from '../Model/userModel.js';
import catchAsync from '../Utils/catchAsync.js';
import sendEmail from '../Utils/email.js';
import generateOtp from '../Utils/generateOtp.js';
import AppError from '../Utils/appError.js';
import jwt from 'jsonwebtoken';


const signToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRETE, {
        expiresIn : process.env.JWT_EXPIRES_IN
    })
};

const createSendToken = (user, statusCode, res, message) =>{
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || true,
        sameSite:process.env.NODE_ENV === "production" ? "none" : "lax"
    };

    res.cookie('token', token, cookieOptions);
    user.password = undefined;
    user.confirmPassword = undefined;
    user.otp = undefined;
    

    res.status(statusCode).json({
        status: 'Success',
        message,
        token,
        data:{
            user,
        }
    })
};

export const signup = catchAsync(async(req, res, next) =>{
    const {username, email, password, confirmPassword, } = req.body;

    const alreadyExist = await User.findOne({email});
    if(alreadyExist) return next(new AppError("Email already exist", 400));

    const otp = generateOtp();

    const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = await User.create({
        username,
        email,
        password,
        confirmPassword,
        otp,
        otpExpires
    })


    try{
        await sendEmail({
            email: newUser.email,
            subject: 'Otp for email verification',
            html: ` <h1> Your Otp is: ${otp}</h1>`
        });
        createSendToken(newUser, 200, res, "Registration succesful");
    }catch(error){
        await User.findByIdAndDelete(newUser.id)
        return next(new AppError("There is an error sending the email. Please try again", 500));
    }
});

// Creating a verify user function
export const verifyAccount = catchAsync(async (req, res, next) =>{
    const {otp} = req.body;

    if(!otp){
        return next( new AppError("Otp is missing!", 400));
    }

    const user = req.user;
    if(user.otp !== otp){
        return next( new AppError("Invalid Otp code!", 400));
    }

    if(Date.now() > user.otpExpires){
        return next( new AppError("Otp already expired. Please request for a new OTP", 400));
    }

    user. isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save({validateBeforeSave: false});
    createSendToken(user, 200, res, "Email has been verified");
});

// Creating resendOtp function

export const resendOtp = catchAsync(async(req, res, next) =>{
    const {email} = req.user;

    if(!email){
        return next( new AppError("Email is required to resend the OTP code", 400));
    };

    const user = await User.findOne({email});

    if(!user){
        return next( new AppError("User not found", 404));
    };

    if(user.isVerified){
        return next( new AppError("This account is already verified", 400));
    };

    const newOtp = generateOtp();
    user.otp = newOtp;
    user.otpExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save({validateBeforeSave: false});

    try{
        await sendEmail({
            email: user.email,
            subject: "Resend OTP for email verification",
            html: `Your new OTP code is : ${newOtp}`
        });
        res.status(200).json({
            status: "success",
            message: "A new OTP code has been send to your email"
        })
    }catch(error){
        console.log("Error Occured while resending the new OTP", error);
        user.otp = undefined,
        user.otpExpires = undefined
        await user.save({validateBeforeSave: false});
        return next( new AppError("There is an error sending the email!. Please try again", 500));
    
    };
});


// creating a login function

export const login = catchAsync(async(req, res, next) =>{
    const {email, password} = req.body;

    if(!email || !password){
        return next( new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({email}).select('+password');

    // compare the password with the saved password in the database

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError("Incorrect email or password", 401));
    };

    createSendToken(user, 200, res, "Login successful");
});

// creating logout functionality

export const logout = catchAsync(async(req, res, next) =>{
    res.cookie("token", "logged out", {
        expires: new Date(Date.now() + 10 + 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    })
});


// creating a forget password function

export const forgetPassword = catchAsync(async(req, res, next) =>{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        return next( new AppError(`The user with this email does not exist`, 404));
    }

    const otp = generateOtp();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 300000;
    await user.save({validateBeforeSave: false});

    try{
        await sendEmail({
            email: user.email,
            subject: "Your password reset OTP (valid for 5mins)",
            html: `<h1>Your password reset OTP is : ${otp}</h1>`
        });

        res.status(200).json({
            status: "success",
            message: "Password reset OTP is send to your email"
        })
    }catch(error){
        console.log("Something went wrong", error);
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next( new AppError("There was an error sending the email! Please try again later"));
    };
});

export const resetPassword = catchAsync( async(req, res, next) =>{
    const {email, otp, password, confirmPassword} = req.body;

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: {$gt: Date.now()}
    });

    if(!user){
        return next( new AppError("No user found", 404));
    };

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;

    await user.save();

    createSendToken(user, 200, res, "Password reset successfully");
});


// creating a Get request

export const getAllUser = catchAsync(async(req, res, next) =>{
    const users = await User.findOne().select('-otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires -__v');

    if(!users){
        return next( new AppError("No users found! Please check the routes", 404));
    }
    res.status(200).json({
        status: "Success",
        results: users.length,
        data:{
            users
        }
    });
}); 



