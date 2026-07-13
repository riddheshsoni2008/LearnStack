import ExerciseHistoryDaily from '../models/ExerciseHistoryDaily';
import mongoose from 'mongoose';

/**
 * Logs an exercise completion grouped by day.
 * @param userId - ID of the user
 * @param exerciseId - ID of the exercise (lesson, quiz, or level)
 * @param title - Title of the exercise
 * @param score - Score or XP rewarded
 * @param exerciseType - 'Lesson' or 'GameLevel'
 * @param trackId - Optional track ID for lessons
 */
const logExerciseCompletion = async (
  userId: mongoose.Types.ObjectId | string,
  exerciseId: mongoose.Types.ObjectId | string,
  title: string,
  score: number = 0,
  exerciseType: 'Lesson' | 'GameLevel' = 'Lesson',
  trackId: mongoose.Types.ObjectId | string | null = null
): Promise<void> => {
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

export { logExerciseCompletion };
