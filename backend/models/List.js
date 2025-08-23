const mongoose = require('mongoose');
const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'board' },
  position: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('list', ListSchema);