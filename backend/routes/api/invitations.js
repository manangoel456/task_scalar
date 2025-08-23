const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Invitation = require('../../models/Invitation');
const Board = require('../../models/Board');
const User = require('../../models/User');
const { notifyUser } = require('../../utils/socket');

// @route   POST /api/invitations
// @desc    Create a new invitation
router.post('/', auth, async (req, res) => {
  const { email, boardId } = req.body;
  try {
    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ msg: 'User not found' });

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ msg: 'Board not found' });

    // Check if already a member
    if (board.members.some(m => String(m.user) === String(invitee._id))) {
      return res.status(400).json({ msg: 'User already a member' });
    }

    // Check if already has a pending invite
    const existing = await Invitation.findOne({
      inviteeEmail: email,
      board: boardId,
      status: 'pending',
    });
    if (existing) return res.status(400).json({ msg: 'Already invited' });

    const newInvitation = new Invitation({
      inviter: req.user.id,
      inviteeEmail: email,
      board: boardId,
    });
    await newInvitation.save();

    // 🔥 Send realtime notification to invitee
    notifyUser(invitee._id, {
      type: 'NEW_INVITATION',
      payload: {
        _id: newInvitation._id,
        board: { _id: board._id, title: board.title },
      },
    });

    res.json(newInvitation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/invitations
// @desc    Get pending invitations for current user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const invitations = await Invitation.find({
      inviteeEmail: user.email,
      status: 'pending',
    })
      .populate('inviter', ['name'])
      .populate('board', ['title']);
    res.json(invitations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/invitations/:id/accept
// @desc    Accept a board invitation
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ msg: 'Invitation not found' });

    const board = await Board.findById(invitation.board);
    if (!board) return res.status(404).json({ msg: 'Board not found' });

    // Add user as member if not already
    if (!board.members.some(m => String(m.user) === String(req.user.id))) {
      board.members.push({ user: req.user.id });
      await board.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/invitations/:id/decline
// @desc    Decline a board invitation
router.post('/:id/decline', auth, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ msg: 'Invitation not found' });

    invitation.status = 'declined';
    await invitation.save();

    res.json({ msg: 'Invitation declined' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
