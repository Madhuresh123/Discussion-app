const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { secretKey } = require('../config');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ _id: user._id }, secretKey);
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    const token = jwt.sign({ _id: user._id }, secretKey);
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Search Users
router.get('/search', auth, async (req, res) => {
  try {
    const users = await User.find({ name: new RegExp(req.query.name, 'i') });
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Follow User
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).send({ error: 'User not found' });
    }
    req.user.following.push(userToFollow._id);
    userToFollow.followers.push(req.user._id);
    await req.user.save();
    await userToFollow.save();
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create User
router.post('/create', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update User
router.put('/update/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete User
router.delete('/delete/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send();
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Show list of users
router.get('/list', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
