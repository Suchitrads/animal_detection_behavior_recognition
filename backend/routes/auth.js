// routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ----------------- Register -----------------
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return res.status(400).json({ msg: 'All fields are required' });

  if (password !== confirmPassword)
    return res.status(400).json({ msg: 'Passwords do not match' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json({
      msg: 'User registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------- Login -----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login Request:', { email, password });

  try {
    const user = await User.findOne({ $or: [{ email }, { name: email }] });
    if (!user)
      return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Invalid credentials' });

    res.status(200).json({ msg: 'Login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//-----------------------------Reset password---------------------------------
router.post('/reset-password-direct', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword)
    return res.status(400).json({ msg: 'All fields are required' });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ msg: 'Passwords do not match' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ msg: 'Password updated successfully' });
});

module.exports = router; // ✅ Export the router!
