const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Card = require('../../models/Card');
const List = require('../../models/List');
const Activity = require('../../models/Activity');
const { broadcast } = require('../../utils/socket');
const { check, validationResult } = require('express-validator');

/**
 * @route   GET api/cards/list/:listId
 * @desc    Get all cards for a list
 * @access  Private
 */
router.get('/list/:listId', auth, async (req, res) => {
  try {
    const cards = await Card.find({ list: req.params.listId })
      .populate('assignees', ['name', 'avatar'])
      .sort({ position: 1 });
    res.json(cards);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * @route   POST api/cards
 * @desc    Create a card
 * @access  Private
 */
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('listId', 'List ID is required').isMongoId(),
      check('boardId', 'Board ID is required').isMongoId(),
      check('position', 'Position is required').isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, listId, boardId, position } = req.body;

      const newCard = new Card({
        title,
        list: listId,
        board: boardId,
        position,
        assignees: [req.user.id], // creator auto-assigned
        labels: [],
      });

      const card = await newCard.save();

      // Activity log
      const activity = new Activity({
        user: req.user.id,
        board: boardId,
        card: card._id,
        action: 'created card',
        details: `added ${card.title}`,
      });
      await activity.save();

      const populatedCard = await Card.findById(card._id).populate('assignees', ['name', 'avatar']);

      broadcast(boardId, { type: 'CARD_CREATED', payload: populatedCard });
      broadcast(boardId, {
        type: 'ACTIVITY_CREATED',
        payload: await activity.populate('user', 'name'),
      });

      res.json(populatedCard);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server Error' });
    }
  }
);

/**
 * @route   PUT api/cards/:id
 * @desc    Update a card's details
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, labels, assignees, dueDate } = req.body;
    let card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (labels !== undefined) card.labels = labels;
    if (assignees !== undefined) card.assignees = assignees;
    if (dueDate !== undefined) card.dueDate = dueDate;

    await card.save();
    const updatedCard = await Card.findById(card._id).populate('assignees', ['name', 'avatar']);

    broadcast(card.board.toString(), { type: 'CARD_UPDATED', payload: updatedCard });
    res.json(updatedCard);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * @route   PUT api/cards/:id/move
 * @desc    Move a card
 * @access  Private
 */
router.put('/:id/move', auth, async (req, res) => {
  const { newListId, newPosition } = req.body;
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    const oldListId = card.list;
    card.position = newPosition;
    if (newListId) card.list = newListId;

    await card.save();

    // If list changed, log activity
    if (newListId && oldListId.toString() !== newListId.toString()) {
      const oldList = await List.findById(oldListId);
      const newList = await List.findById(newListId);

      if (oldList && newList) {
        const activity = new Activity({
          user: req.user.id,
          board: card.board,
          card: card._id,
          action: 'moved card',
          details: `moved ${card.title} from ${oldList.title} to ${newList.title}`,
        });
        await activity.save();
        broadcast(card.board.toString(), {
          type: 'ACTIVITY_CREATED',
          payload: await activity.populate('user', 'name'),
        });
      }
    }

    broadcast(card.board.toString(), {
      type: 'CARD_MOVED',
      payload: { cardId: card._id, oldListId, newListId: card.list, newPosition },
    });

    res.json(card);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * @route   DELETE api/cards/:id
 * @desc    Delete a card
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Card not found' });

    await card.deleteOne();

    broadcast(card.board.toString(), {
      type: 'CARD_DELETED',
      payload: { cardId: req.params.id, listId: card.list },
    });

    res.json({ msg: 'Card removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
