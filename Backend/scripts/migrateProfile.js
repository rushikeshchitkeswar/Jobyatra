const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobyatra');
        console.log('Connected to MongoDB for migration...');

        // Use a generic model to allow dynamic field access
        const Profile = mongoose.connection.collection('candidateprofiles');

        // 1. Rename basic info fields
        // headline -> professionalHeadline
        // bio -> summary
        // profileImage -> profilePhoto
        const result = await Profile.updateMany({}, [
            {
                $set: {
                    professionalHeadline: { $ifNull: ["$professionalHeadline", "$headline"] },
                    summary: { $ifNull: ["$summary", "$bio"] },
                    profilePhoto: { $ifNull: ["$profilePhoto", "$profileImage"] }
                }
            },
            {
                $unset: ["headline", "bio", "profileImage"]
            }
        ]);

        // console.log(`Migration successful! Modified ${result.modifiedCount} documents.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
