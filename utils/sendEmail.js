const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async ({ email, subject, message }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Zenith Education", email: process.env.EMAIL_USER },
        to: [{ email }],
        subject,
        htmlContent: message,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API:", response.data);
    return response.data; // 🔥 must return
  } catch (error) {
    console.error("❌ Brevo API email failed:", error.response?.data || error.message);
    throw new Error("Email could not be sent via Brevo API.");
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