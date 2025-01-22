import mongoose from 'mongoose';
import validator from 'validator';
import becrypt from 'bcryptjs'; 

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Please provide a username'],
        trim: true,
        maxlenght: 30,
        index: true
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        minlenght: 60,
        maxlenght: 150,
        lowercase: true,
        validate:[validator.isEmail, "Please provide a valid email"]
    },
    password:{
        type: String,
        required: [true, 'please provide a password'],
        select: false,
        minlenght: 8,
        maxlenght: 30
    },
    confirmPassword:{
        type: String,
        minlenght: 8,
        maxlenght: 30,
        required: [true, 'please confirm your password'],
        validate:{
            validator: function(el){
                return el===this.password
            },
            message: 'password not the same as confirm password'
        },
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    otp:{
        type: String,
        default: null
    },
    otpExpires:{
        type: Date,
        default: null
    },
    resetPasswordOtp:{
        type: String,
        default: null
    },
    resetPasswordOtpExpires:{
        type: Date,
        default: null
    },
    createtAt:{
        type: Date,
        default: Date.now
    }
}, {
    timeseries: true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password'))return next()
        this.password = await becrypt.hash(this.password, 12)

    this.confirmPassword = undefined;
    next();
});

userSchema.methods.correctPassword = async function(password, userPassword){
    return becrypt.compare(password, userPassword)
}

const User = mongoose.model("User", userSchema);

export default User;