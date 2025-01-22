
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config({path: './config.env'});
import app from './app.js';

const port = process.env.PORT || 3000;
const Dev = process.env.NODE_ENV;

console.log(port);
console.log(Dev);
console.log('greetings from backend server');
const Db = process.env.DB_URL
const dbConnect = await mongoose.connect(Db).then(() =>{
    console.log('Db connected succesfully')
})
dbConnect()
.catch((err) =>{
    console.log('Unable to connect to db', err)
});
app.listen(port, ()=>{
    console.log(`The server started running on port ${port}`)
});