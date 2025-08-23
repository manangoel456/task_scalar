const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  list: { type: Schema.Types.ObjectId, ref: 'list' },
  board: { type: Schema.Types.ObjectId, ref: 'board' },
  position: { type: Number, required: true },
  assignees: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  labels: [{
    text: String,
    color: String,
  }],
  dueDate: { type: Date },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('card', CardSchema);