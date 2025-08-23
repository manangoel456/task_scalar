const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Board = require('../../models/Board');
const User = require('../../models/User');
const Workspace = require('../../models/Workspace');
const { check, validationResult } = require('express-validator');
const { broadcast } = require('../../utils/socket');
const List = require('../../models/List');
// @route   POST api/boards
// @desc    Create a board
// @route   POST api/boards
// @desc    Create a board and its default lists
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('workspaceId', 'Workspace ID is required').isMongoId(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, workspaceId, visibility } = req.body;
      
      // 1. Create the new board
      const newBoard = new Board({
        title,
        workspace: workspaceId,
        user: req.user.id,
        visibility,
        members: [{ user: req.user.id }],
      });
      const board = await newBoard.save();

      // 2. NEW: Create the default lists for the new board
      const defaultLists = [
        { title: 'Backlog', board: board._id, position: 65536 },
        { title: 'In-Progress', board: board._id, position: 131072 },
        { title: 'Done', board: board._id, position: 196608 }
      ];
      await List.insertMany(defaultLists);

      // 3. Send the created board back to the frontend
      res.json(board);
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/boards/shared
// @desc    Get boards shared with the current user
router.get('/shared', auth, async (req, res) => {
    try {
      const boards = await Board.find({
        'members.user': req.user.id, 
        user: { $ne: req.user.id },
      }).populate('user', ['name']);
      res.json(boards);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route   GET api/boards/workspace/:workspaceId
// @desc    Get all boards for a workspace
router.get('/workspace/:workspaceId', auth, async (req, res) => {
  try {
    const boards = await Board.find({ workspace: req.params.workspaceId, 'members.user': req.user.id });
    res.json(boards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/boards/:id
// @desc    Get board by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ msg: 'Board not found' });
        if (!board.members.some(member => member.user.toString() === req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        res.json(board);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/boards/:id/members
// @desc    Get board members
router.get('/:id/members', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('members.user', ['name', 'email']);
    if (!board) return res.status(404).json({ msg: 'Board not found' });
    res.json(board.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/boards/:boardId/members/:memberId
// @desc    Remove a member from a board
router.delete('/:boardId/members/:memberId', auth, async (req, res) => {
    try {
        const board = await Board.findById(req.params.boardId);
        if (!board) return res.status(404).json({ msg: 'Board not found' });
        if (board.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        board.members = board.members.filter(
            ({ user }) => user.toString() !== req.params.memberId
        );
        await board.save();
        const updatedBoard = await Board.findById(req.params.boardId).populate('members.user', ['name', 'email']);
        res.json(updatedBoard.members);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;