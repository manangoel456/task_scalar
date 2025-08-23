const mongoose = require('mongoose');
const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'board' },
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'card' },
  action: { type: String, required: true }, // e.g., 'created card', 'moved card'
  details: { type: String }, // e.g., 'from "To Do" to "In Progress"'
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('activity', ActivitySchema);