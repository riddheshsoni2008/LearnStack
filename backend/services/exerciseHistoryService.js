const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');

/**
 * Logs an exercise completion grouped by day.
 * @param {string} userId - ID of the user
 * @param {string} exerciseId - ID of the exercise (lesson, quiz, or level)
 * @param {string} title - Title of the exercise
 * @param {number} score - Score or XP rewarded
 * @param {string} exerciseType - 'Lesson' or 'GameLevel'
 * @param {string} trackId - Optional track ID for lessons
 */
const logExerciseCompletion = async (userId, exerciseId, title, score = 0, exerciseType = 'Lesson', trackId = null) => {
  try {
    const todayString = new Date().toISOString().split('T')[0];

    // Create the daily document if it doesn't exist
    await ExerciseHistoryDaily.updateOne(
      { userId, date: todayString },
      { $setOnInsert: { userId, date: todayString } },
      { upsert: true }
    );

    // Push the exercise if it hasn't been completed today
    await ExerciseHistoryDaily.updateOne(
      { 
        userId, 
        date: todayString,
        completedExercises: {
          $not: {
            $elemMatch: {
              exerciseId: exerciseId,
              title: title
            }
          }
        }
      },
      {
        $push: {
          completedExercises: {
            exerciseId,
            exerciseType,
            trackId,
            title,
            completedAt: new Date(),
            score
          }
        }
      }
    );
  } catch (error) {
    console.error('Error logging daily exercise completion:', error);
  }
};

module.exports = { logExerciseCompletion };
