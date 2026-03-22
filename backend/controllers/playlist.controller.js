const Playlist = require('../models/Playlist');
const { cloudinary } = require('../config/cloudinary');

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.create({
      name, description: description || '',
      user: req.user._id,
      image: req.file?.path || '',
      imagePublicId: req.file?.filename || '',
    });
    res.status(201).json({ success: true, playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate({ path: 'songs', populate: [{ path: 'artist' }, { path: 'category' }] })
      .sort('-createdAt');
    res.json({ success: true, playlists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({ path: 'songs', populate: [{ path: 'artist' }, { path: 'category' }] })
      .populate('user', 'name profileImage');
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const { songId } = req.body;
    if (playlist.songs.includes(songId))
      return res.status(400).json({ success: false, message: 'Song already in playlist' });
    playlist.songs.push(songId);
    await playlist.save();
    res.json({ success: true, message: 'Song added to playlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    playlist.songs = playlist.songs.filter(s => s.toString() !== req.params.songId);
    await playlist.save();
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (playlist.imagePublicId) await cloudinary.uploader.destroy(playlist.imagePublicId);
    await playlist.deleteOne();
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const { name, description } = req.body;
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (req.file) {
      if (playlist.imagePublicId) await cloudinary.uploader.destroy(playlist.imagePublicId);
      playlist.image = req.file.path;
      playlist.imagePublicId = req.file.filename;
    }
    await playlist.save();
    res.json({ success: true, playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
