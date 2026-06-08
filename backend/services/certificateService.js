const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Track = require('../models/Track');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const ExerciseHistoryDaily = require('../models/ExerciseHistoryDaily');
const User = require('../models/User');
const crypto = require('crypto');

const generateCertId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LS-${year}-${random}`;
};

const getBaseUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const generateQrCodeUrl = (url) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;

/**
 * Evaluates and awards multi-track certificates (ADVANCED and PROFESSIONAL).
 * Atomic and idempotent.
 */
const evaluateAdvancedCertifications = async (userId, user) => {
  try {
    const earnedTracksCount = await Certificate.countDocuments({ userId, certificateType: 'TRACK', isValid: true });
    const totalPublishedTracks = await Track.countDocuments({ isPublished: true });

    const awards = [];

    // Check for ADVANCED certificate (3 or more tracks)
    if (earnedTracksCount >= 3) {
      const advancedCertId = generateCertId();
      const verificationUrl = `${getBaseUrl()}/certificates/${advancedCertId}`;
      const advancedData = {
        $setOnInsert: {
          certificateId: advancedCertId,
          userId,
          certificateType: 'ADVANCED',
          studentName: user.name,
          completionPercentage: 100,
          totalLessons: 0,
          completedLessons: 0,
          totalQuizzes: 0,
          completedQuizzes: 0,
          verificationUrl,
          qrCodeUrl: generateQrCodeUrl(verificationUrl),
          isValid: true,
          isRevoked: false,
          issuedAt: new Date()
        }
      };

      try {
        const advCert = await Certificate.findOneAndUpdate(
          { userId, certificateType: 'ADVANCED' },
          advancedData,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        if (advCert && advCert.createdAt.getTime() === advCert.updatedAt.getTime()) {
          awards.push(advCert);
        }
      } catch (err) {
        if (err.code !== 11000) console.error('Error awarding ADVANCED cert:', err);
      }
    }

    // Check for PROFESSIONAL certificate (All tracks)
    if (totalPublishedTracks > 0 && earnedTracksCount === totalPublishedTracks) {
      const profCertId = generateCertId();
      const verificationUrl = `${getBaseUrl()}/certificates/${profCertId}`;
      const profData = {
        $setOnInsert: {
          certificateId: profCertId,
          userId,
          certificateType: 'PROFESSIONAL',
          studentName: user.name,
          completionPercentage: 100,
          totalLessons: 0,
          completedLessons: 0,
          totalQuizzes: 0,
          completedQuizzes: 0,
          verificationUrl,
          qrCodeUrl: generateQrCodeUrl(verificationUrl),
          isValid: true,
          isRevoked: false,
          issuedAt: new Date()
        }
      };

      try {
        const profCert = await Certificate.findOneAndUpdate(
          { userId, certificateType: 'PROFESSIONAL' },
          profData,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        if (profCert && profCert.createdAt.getTime() === profCert.updatedAt.getTime()) {
          awards.push(profCert);
        }
      } catch (err) {
        if (err.code !== 11000) console.error('Error awarding PROFESSIONAL cert:', err);
      }
    }

    return awards;
  } catch (error) {
    console.error('Error evaluating advanced certifications:', error);
    return [];
  }
};

const checkAndAwardCertificate = async (userId, trackId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    let trackAwarded = null;

    const existingCert = await Certificate.findOne({ userId, trackId, certificateType: 'TRACK' });

    if (!existingCert) {

      const track = await Track.findById(trackId);
      if (track) {

        const publishedLessons = await Lesson.find({ trackId, isPublished: true }).select('_id');
        const lessonIds = publishedLessons.map(l => l._id.toString());
        const totalLessons = lessonIds.length;

        if (totalLessons > 0) {
          const quizzes = await Quiz.find({ lessonId: { $in: lessonIds } }).select('lessonId');
          const quizLessonIds = quizzes.map(q => q.lessonId.toString());
          const totalQuizzes = quizLessonIds.length;

          const historyDocs = await ExerciseHistoryDaily.find({
            userId,
            'completedExercises.trackId': trackId
          });

          const completedLessonIds = new Set();
          const completedQuizLessonIds = new Set();

          historyDocs.forEach(day => {
            day.completedExercises.forEach(ex => {
              if (ex.trackId && ex.trackId.toString() === trackId.toString() && ex.exerciseType === 'Lesson') {
                const exIdStr = ex.exerciseId.toString();
                if (ex.title.includes(' - Quiz')) {
                  completedQuizLessonIds.add(exIdStr);
                  completedLessonIds.add(exIdStr);
                } else {
                  completedLessonIds.add(exIdStr);
                }
              }
            });
          });

          let validCompletedLessons = 0;
          lessonIds.forEach(id => {
            if (completedLessonIds.has(id)) validCompletedLessons++;
          });

          let validCompletedQuizzes = 0;
          quizLessonIds.forEach(id => {
            if (completedQuizLessonIds.has(id)) validCompletedQuizzes++;
          });

          const isLessonsComplete = validCompletedLessons === totalLessons;
          const isQuizzesComplete = validCompletedQuizzes === totalQuizzes;

          let completionPercentage = 0;
          if (totalLessons + totalQuizzes > 0) {
            completionPercentage = Math.round(((validCompletedLessons + validCompletedQuizzes) / (totalLessons + totalQuizzes)) * 100);
          }

          if (isLessonsComplete && isQuizzesComplete && completionPercentage === 100) {
            // Create TRACK certificate safely with atomic operation
            const newCertificateId = generateCertId();
            const verificationUrl = `${getBaseUrl()}/certificates/${newCertificateId}`;

            const certData = {
              $setOnInsert: {
                certificateId: newCertificateId,
                userId,
                certificateType: 'TRACK',
                trackId,
                studentName: user.name,
                trackName: track.title,
                completionPercentage: 100,
                totalLessons,
                completedLessons: validCompletedLessons,
                totalQuizzes,
                completedQuizzes: validCompletedQuizzes,
                verificationUrl,
                qrCodeUrl: generateQrCodeUrl(verificationUrl),
                isValid: true,
                isRevoked: false,
                issuedAt: new Date()
              }
            };

            try {
              const certificate = await Certificate.findOneAndUpdate(
                { userId, certificateType: 'TRACK', trackId },
                certData,
                { new: true, upsert: true, setDefaultsOnInsert: true }
              );
              trackAwarded = certificate;
            } catch (err) {
              if (err.code !== 11000) throw err; // Ignore duplicate key errors
            }
          }
        }
      }
    } else {
      trackAwarded = existingCert;
    }

    // Always evaluate advanced certifications (in case they previously completed tracks but didn't get the advanced certs)
    const advancedAwards = await evaluateAdvancedCertifications(userId, user);

    // Return the primary track certificate if it was just awarded or existed, 
    // along with any new advanced awards. We typically return the most recent award to UI.
    return trackAwarded;

  } catch (error) {
    console.error('Error in checkAndAwardCertificate:', error);
    return null;
  }
};

module.exports = {
  checkAndAwardCertificate,
  evaluateAdvancedCertifications
};
