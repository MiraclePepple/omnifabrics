import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER or EMAIL_PASS is not set in .env");
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // you can change this depending on your email provider
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Send email function
export const sendEmail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
