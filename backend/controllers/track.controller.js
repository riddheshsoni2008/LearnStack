const Track = require('../models/Track');
const Lesson = require('../models/Lesson');

// @desc    Get all published tracks
// @route   GET /api/tracks
// @access  Public
const getTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ isPublished: true }).sort({ order: 1 });
    res.status(200).json({ success: true, data: tracks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single track with its lessons
// @route   GET /api/tracks/:id
// @access  Public
const getTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    // Get all lessons for this track, grouped by week
    const lessons = await Lesson.find({ trackId: track._id, isPublished: true })
      .sort({ weekNumber: 1, order: 1 })
      .select('-codeSnippet -content'); // Don't send full content in listing

    res.status(200).json({ success: true, data: { track, lessons } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a track (admin)
// @route   POST /api/tracks
// @access  Private/Admin
const createTrack = async (req, res) => {
  try {
    const track = await Track.create(req.body);
    res.status(201).json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a track (admin)
// @route   PUT /api/tracks/:id
// @access  Private/Admin
const updateTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.status(200).json({ success: true, data: track });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a track (admin)
// @route   DELETE /api/tracks/:id
// @access  Private/Admin
const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    // Also delete all lessons in this track
    await Lesson.deleteMany({ trackId: track._id });
    res.status(200).json({ success: true, message: 'Track deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTracks, getTrack, createTrack, updateTrack, deleteTrack };
