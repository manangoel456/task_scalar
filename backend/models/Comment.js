const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String, required: true },
  card: { type: Schema.Types.ObjectId, ref: 'card', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('comment', CommentSchema);