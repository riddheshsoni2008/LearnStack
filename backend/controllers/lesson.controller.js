const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// @desc    Get single lesson (full content)
// @route   GET /api/lessons/:id
// @access  Public
const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('trackId', 'title slug');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Also get the quiz for this lesson
    const quiz = await Quiz.findOne({ lessonId: lesson._id });

    // Get next and previous lesson
    const nextLesson = await Lesson.findOne({
      trackId: lesson.trackId,
      isPublished: true,
      $or: [
        { weekNumber: lesson.weekNumber, order: { $gt: lesson.order } },
        { weekNumber: { $gt: lesson.weekNumber } }
      ]
    }).sort({ weekNumber: 1, order: 1 }).select('_id title');

    const prevLesson = await Lesson.findOne({
      trackId: lesson.trackId,
      isPublished: true,
      $or: [
        { weekNumber: lesson.weekNumber, order: { $lt: lesson.order } },
        { weekNumber: { $lt: lesson.weekNumber } }
      ]
    }).sort({ weekNumber: -1, order: -1 }).select('_id title');

    res.status(200).json({
      success: true,
      data: {
        lesson,
        quiz: quiz || null,
        nextLesson: nextLesson || null,
        prevLesson: prevLesson || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a lesson (admin)
// @route   POST /api/lessons
// @access  Private/Admin
const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a lesson (admin)
// @route   PUT /api/lessons/:id
// @access  Private/Admin
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a lesson (admin)
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    // Also delete quiz for this lesson
    await Quiz.deleteMany({ lessonId: lesson._id });
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLesson, createLesson, updateLesson, deleteLesson };
