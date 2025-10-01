// utils/email.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});

export const emailService = {
  async send(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
      console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (err) {
      console.error('Email sending failed:', err);
      throw new Error('Failed to send email');
    }
  },

  async sendOTP(to: string, code: string) {
    const subject = 'Your OTP Code';
    const html = `
      <p>Hi,</p>
      <p>Your OTP code is: <b>${code}</b></p>
      <p>This code will expire in 10 minutes.</p>
    `;
    await this.send(to, subject, html);
  },
};
