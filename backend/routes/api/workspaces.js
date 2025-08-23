const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Workspace = require('../../models/Workspace');
const { check, validationResult } = require('express-validator');

// @route   POST api/workspaces
// @desc    Create a workspace
// @access  Private
router.post('/', [auth, [check('name', 'Name is required').not().isEmpty()]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const newWorkspace = new Workspace({ name: req.body.name, user: req.user.id });
    const workspace = await newWorkspace.save();
    res.json(workspace);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/workspaces
// @desc    Get all workspaces for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workspaces);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;