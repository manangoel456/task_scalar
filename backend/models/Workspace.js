const mongoose = require('mongoose');
const WorkspaceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('workspace', WorkspaceSchema);