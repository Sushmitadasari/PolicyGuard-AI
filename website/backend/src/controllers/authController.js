const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const buildAuthResponse = (user, token) => ({
  success: true,
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'JWT secret is not configured',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'JWT secret is not configured',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json(buildAuthResponse(user, token));
  } catch (error) {
    return next(error);
  }
};

const logout = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please remove token on client side.',
  });
};

module.exports = {
  register,
  login,
  logout,
};
