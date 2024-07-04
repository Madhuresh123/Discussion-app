const express = require('express');
const router = express.Router();
const multer = require('multer');
const Discussion = require('../models/discussion');
const auth = require('../middleware/auth');


const upload = multer({ dest: 'uploads/' });

// Create Discussion
router.post('/create', auth, upload.single('image'), async (req, res) => {
  try {
    const discussion = new Discussion({
      user: req.user._id,
      text: req.body.text,
      image: req.file ? req.file.filename : null,
      hashtags: req.body.hashtags.split(',').map(tag => tag.trim())
    });
    await discussion.save();
    res.status(201).send(discussion);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Like Discussion
router.post('/like/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    discussion.likes.push(req.user._id);
    await discussion.save();
    res.send(discussion);
  } catch (err) {
    res.status(500).send(err);
  }
});


// Update Discussion
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      text: req.body.text,
      hashtags: req.body.hashtags.split(',').map(tag => tag.trim())
    };
    if (req.file) updateData.image = req.file.filename;
    const discussion = await Discussion.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!discussion) return res.status(404).send();
    res.send(discussion);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Comment on Discussion
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    discussion.comments.push({ user: req.user._id, text: req.body.text });
    await discussion.save();
    res.send(discussion);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Like Comment
router.post('/comment/like/:discussionId/:commentId', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found' });
    }
    comment.likes.push(req.user._id);
    await discussion.save();
    res.send(discussion);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete Discussion
router.delete('/delete/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndDelete(req.params.id);
    if (!discussion) return res.status(404).send();
    res.send(discussion);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get list of discussions based on tags
router.get('/tags', async (req, res) => {
  try {
    const discussions = await Discussion.find({ hashtags: { $in: req.query.tags.split(',') } });
    res.send(discussions);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get list of discussions based on certain text
router.get('/search', async (req, res) => {
  try {
    const discussions = await Discussion.find({ text: new RegExp(req.query.text, 'i') });
    res.send(discussions);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
