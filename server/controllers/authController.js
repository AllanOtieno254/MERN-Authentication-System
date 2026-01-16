import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE
} from '../config/emailTemplates.js';

const isProduction = process.env.NODE_ENV === 'production';

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'All fields are required' });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: `"Kenyatta National Hospital" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: 'Welcome to Kenyatta National Hospital Digital Services',
      html: `
        <p>Dear ${user.name},</p>
        <p>Welcome to <strong>Kenyatta National Hospital Digital Services</strong>.</p>
        <p>Your account has been created with email <strong>${user.email}</strong>.</p>
        <p>Warm regards,<br/>KNH Digital Team</p>
      `
    });

    return res.json({ success: true, message: 'Registered successfully' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password required' });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Login successful' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= SEND VERIFY OTP =================
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: 'Account already verified' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: `"KNH" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: 'Email Verification OTP',
      html: EMAIL_VERIFY_TEMPLATE
        .replace('{{otp}}', otp)
        .replace('{{email}}', user.email),
    });

    res.json({ success: true, message: 'OTP sent' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await UserModel.findById(req.userId);

    if (!user || user.verifyOtp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: 'Email verified' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= AUTH CHECK =================
export const isAuthenticated = async (req, res) => {
  return res.json({ success: true });
};
