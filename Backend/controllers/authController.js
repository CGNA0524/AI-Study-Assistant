const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: `Error registering user: ${error.message}` });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: `Error logging in: ${error.message}` });
  }
};

// Google OAuth Login/Register
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      console.error('[OAuth] No token provided');
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify and decode the Google token
    const { OAuth2Client } = require('google-auth-library');
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '126353575172-or6l7aeqnn88q1v2g4h11hr23cfp278n.apps.googleusercontent.com';
    
    console.log('[OAuth] Verifying token with Client ID:', googleClientId.substring(0, 20) + '...');
    const client = new OAuth2Client(googleClientId);
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('[OAuth] Token verified successfully for email:', email);

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log('[OAuth] Creating new user for email:', email);
      // Create new user if doesn't exist
      user = await User.create({
        name: name || 'Google User',
        email,
        password: await bcrypt.hash(googleId + Math.random().toString(36), 10), // Generate random password
        googleId,
      });
    } else if (!user.googleId) {
      console.log('[OAuth] Linking Google account to existing user:', email);
      // Link Google account to existing user
      user.googleId = googleId;
      await user.save();
    } else {
      console.log('[OAuth] User already exists with Google ID:', email);
    }

    const jwtToken = generateToken(user._id);
    console.log('[OAuth] Successfully authenticated user:', email);
    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('[OAuth] Token verification failed:');
    console.error('[OAuth] Error name:', error.name);
    console.error('[OAuth] Error message:', error.message);
    console.error('[OAuth] Full error:', error);
    res.status(500).json({ message: `Error with Google login: ${error.message}` });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user account permanently
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const Note = require('../models/Note');
    const ChatSession = require('../models/ChatSession');

    // Delete all notes belonging to user
    await Note.deleteMany({ userId });
    
    // Delete all chat sessions belonging to user
    await ChatSession.deleteMany({ userId });
    
    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: error.message });
  }
};
