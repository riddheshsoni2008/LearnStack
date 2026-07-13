import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://riddheshsoni:RIDDHESHSONI123@riddheshsoni.smlgcdg.mongodb.net/learnstack?retryWrites=true&w=majority&appName=Riddheshsoni";

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas!");

    const { getRoundQuestions   } = require('../controllers/hackathon.controller');
    const User = require('../models/User');
    const Hackathon = require('../models/Hackathon');

    // Let's find a user who has Round 2 active/qualified
    // User: prince (prince@gmail.com), Round 2 is IN_PROGRESS
    const user = await User.findOne({ email: "prince@gmail.com" });
    if (!user) {
      console.log("User not found!");
      return;
    }

    // Mock Express Request & Response
    const req: any = {
      params: {
        slug: "learnstack-hackathon-2",
        roundNumber: "2"
      },
      user: user
    };

    const res: any = {
      statusCode: 200,
      json: function(data) {
        console.log("\n--- API RESPONSE ---");
        console.log("Success:", data.success);
        if (data.success) {
          console.log("Round Number:", data.data.round?.roundNumber);
          console.log("Round Type:", data.data.round?.type);
          console.log("Has Questions:", !!data.data.questions);
          console.log("Challenge:", data.data.challenge ? {
            title: data.data.challenge.challengeTitle,
            difficulty: data.data.challenge.difficulty
          } : null);
        } else {
          console.log("Message:", data.message);
        }
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      }
    };

    await getRoundQuestions(req, res);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
