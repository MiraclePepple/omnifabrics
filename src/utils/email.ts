import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendOTPEmail(to: string, code: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,       // your Gmail address
      pass: process.env.EMAIL_APP_PASS,   // App password
    },
  });

  const mailOptions = {
    from: `"Omnifabrics" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your OTP for Store Creation',
    html: `
      <p>Hi,</p>
      <p>Your OTP for creating a store is: <b>${code}</b></p>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP ${code} sent to ${to}`);
}
