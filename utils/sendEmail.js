// utils/sendEmail.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services like SendGrid, Mailgun etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;