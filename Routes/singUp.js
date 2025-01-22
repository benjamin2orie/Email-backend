
import express from 'express';
import {forgetPassword, getAllUser, login, logout, resendOtp, resetPassword, signup, verifyAccount } from '../Controller/authController.js'
import isAuthenticated from '../Middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify',isAuthenticated, verifyAccount);
router.post('/resend-otp', isAuthenticated, resendOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.get('/getAllUsers', getAllUser);



export default router;