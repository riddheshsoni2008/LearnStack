import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://riddheshsoni:RIDDHESHSONI123@riddheshsoni.smlgcdg.mongodb.net/learnstack?retryWrites=true&w=majority&appName=Riddheshsoni";

async function main() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    // Dynamically require models
    const Hackathon = require('../models/Hackathon');
    const HackathonRegistration = require('../models/HackathonRegistration');
    const HackathonSubmission = require('../models/HackathonSubmission');
    const HackathonChallenge = require('../models/HackathonChallenge');
    const User = require('../models/User');

    // 1. Get all hackathons

    const hackathons = await Hackathon.find({});
    for (const h of hackathons) {
      console.log(`Title: ${h.title}, Slug: ${h.slug}, ID: ${h._id}`);
      console.log(
        "Rounds:",
        h.rounds.map((r) => ({
          roundNumber: r.roundNumber,
          type: r.type,
          status: r.status,
        })),
      );
    }

    // 2. Get registrations

    const registrations = await HackathonRegistration.find({}).populate(
      "userId",
      "name email",
    );
    for (const r of registrations) {
      console.log(
        `User: ${r.userId?.name} (${r.userId?.email}), Round: ${r.currentRound}, Status: ${r.status}`,
      );
    }

    // 3. Get challenges;
    const challenges = await HackathonChallenge.find({}).populate(
      "assignedTo",
      "name email",
    );

    // 4. Get submissions
    const submissions = await HackathonSubmission.find({}).populate(
      "userId",
      "name email",
    );
  } catch (err) {
    console.error("Error during inspection:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

main();
