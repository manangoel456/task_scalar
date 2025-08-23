const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Comment = require('../../models/Comment');
const Card = require('../../models/Card');
const { check, validationResult } = require('express-validator');
const { broadcast } = require('../../utils/socket');

// @route   POST api/comments
// @desc    Add a comment to a card
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),
    check('cardId', 'Card ID is required').isMongoId(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { text, cardId } = req.body;
        const card = await Card.findById(cardId);
        if (!card) return res.status(404).json({ msg: 'Card not found' });

        const newComment = new Comment({
            text,
            card: cardId,
            user: req.user.id,
        });

        const comment = await newComment.save();
        const populatedComment = await Comment.findById(comment._id).populate('user', ['name', 'avatar']);

        broadcast(card.board.toString(), { type: 'COMMENT_ADDED', payload: populatedComment });
        res.json(populatedComment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/comments/card/:cardId
// @desc    Get all comments for a card
router.get('/card/:cardId', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ card: req.params.cardId })
            .populate('user', ['name', 'avatar'])
            .sort({ date: 1 }); // Show oldest comments first
        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;