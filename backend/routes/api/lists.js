const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const List = require('../../models/List');
const { check, validationResult } = require('express-validator');

// @route   POST api/lists
// @desc    Create a list
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('boardId', 'Board ID is required').isMongoId(),
      check('position', 'Position is required').isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, boardId, position } = req.body;
      const newList = new List({ title, board: boardId, position });
      const list = await newList.save();
      res.json(list);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/lists/board/:boardId
// @desc    Get all lists for a board
// @access  Private
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const lists = await List.find({ board: req.params.boardId }).sort({ position: 1 });
    res.json(lists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;