const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Playlist name required'], trim: true, maxlength: 100 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  description: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
