const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,  // e.g. smtp-relay.brevo.com
      port: process.env.EMAIL_PORT,  // e.g. 587
      secure: false, // ✅ 587 = TLS (not SSL)
      auth: {
        user: process.env.EMAIL_USER, // your Brevo user
        pass: process.env.EMAIL_PASS, // your Brevo API key
      },
    });

    const mailOptions = {
      from: `"Zenith Education" <${process.env.EMAIL_USER}>`, // nice branding
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error('Email could not be sent.');
  }
};

module.exports = sendEmail;






// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');

// dotenv.config();

// const sendEmail = async (options) => {
//     // Create a transporter
//     const transporter = nodemailer.createTransport({
//         service: 'gmail', // You can use other services like SendGrid, Mailgun etc.
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: options.email,
//         subject: options.subject,
//         html: options.message
//     };

//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;