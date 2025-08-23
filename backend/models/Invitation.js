const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new Schema({
  inviter: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  inviteeEmail: { type: String, required: true },
  board: { type: Schema.Types.ObjectId, ref: 'board', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('invitation', InvitationSchema);