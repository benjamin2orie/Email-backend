
import nodemailer from 'nodemailer';


const sendEmail = async(options) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: process.env.EMAIL,
            pass: process.env.E_PASSWORD
        }
    });

    const emailOptions = {
        from: process.env.EMAIL,
        to: options.email,
        subject: options.subject,
        html: options.html,
    }

    await transporter.sendMail(emailOptions);
};

export default sendEmail;