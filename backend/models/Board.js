const mongoose = require('mongoose');
const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'workspace' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  members: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' } }],
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('board', BoardSchema);