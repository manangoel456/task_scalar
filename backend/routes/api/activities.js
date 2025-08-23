const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Activity = require('../../models/Activity');

// @route   GET /api/activities/board/:boardId
// @desc    Get activities for a board
// @access  Private
router.get('/board/:boardId', auth, async (req, res) => {
    try {
        const activities = await Activity.find({ board: req.params.boardId })
            .populate('user', ['name'])
            .sort({ date: -1 })
            .limit(20);
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;