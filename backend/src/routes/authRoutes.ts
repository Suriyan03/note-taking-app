import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { User } from '../models/User';
import { OTP } from '../models/OTP';
import nodemailer from 'nodemailer';
import * as otpGenerator from 'otp-generator';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// @route   POST /api/auth/signup
// @desc    Register a new user with email and password
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    // Generate JWT token with user info
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('Server configuration error');
    
    const payload = { user: { id: newUser.id, name: newUser.name, email: newUser.email } };
    const authToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ msg: 'User registered successfully!', token: authToken });

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/auth/login
// @desc    Authenticate user and get JWT token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token with user info
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('Server configuration error');
    
    const payload = { user: { id: user.id, name: user.name, email: user.email } };
    const authToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.json({ token: authToken });

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/auth/send-otp
// @desc    Send a one-time password to a user's email
// @access  Public
router.post('/send-otp', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    await OTP.deleteOne({ email });

    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false });

    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Notes App OTP',
      html: `<h1>Your One-Time Password is: ${otp}</h1>`,
    };

    await transporter.sendMail(mailOptions);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('Server configuration error');

    const tempPayload = { name, email, password };
    const tempToken = jwt.sign(tempPayload, jwtSecret, { expiresIn: '10m' });

    res.status(200).json({ msg: 'OTP sent to your email', tempToken });

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and register the user
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { otp, tempToken } = req.body;

  try {
    if (!otp || !tempToken) {
        return res.status(400).json({ msg: 'Please provide OTP and temporary token' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('Server configuration error');

    const decoded: any = jwt.verify(tempToken, jwtSecret);
    const { name, email, password } = decoded;

    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({ msg: 'OTP has expired or is invalid' });
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    await OTP.deleteOne({ email });

    // Generate JWT token with user info
    const payload = { user: { id: newUser.id, name: newUser.name, email: newUser.email } };
    const authToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    res.status(201).json({ msg: 'User registered successfully!', token: authToken });

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google token
// @access  Public
router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ msg: 'No token provided' });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) throw new Error('Server configuration error');

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });
    
    const payload = ticket.getPayload() as TokenPayload;
    if (!payload) {
        return res.status(400).json({ msg: 'Invalid Google token' });
    }
    const { email, name, sub } = payload;
    const googleId = sub;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
      });
      await user.save();
    }

    // Generate JWT token with user info
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('Server configuration error');

    const appTokenPayload = { user: { id: user.id, name: user.name, email: user.email } };
    const appToken = jwt.sign(appTokenPayload, jwtSecret, { expiresIn: '1h' });
    res.json({ token: appToken });

  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

export default router;