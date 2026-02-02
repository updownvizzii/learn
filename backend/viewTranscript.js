// Script to view transcript from database
require('dotenv').config();
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

async function viewTranscript() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all courses
        const courses = await Course.find({});

        console.log('📚 Searching for transcripts...\n');

        let foundTranscript = false;

        for (const course of courses) {
            console.log(`Course: ${course.title}`);

            if (course.sections) {
                for (const section of course.sections) {
                    for (const lecture of section.lectures) {
                        if (lecture.transcript) {
                            foundTranscript = true;
                            console.log('\n' + '='.repeat(80));
                            console.log(`📹 Lecture: ${lecture.title}`);
                            console.log(`📄 Transcription Status: ${lecture.transcriptionStatus}`);
                            console.log('='.repeat(80));
                            console.log('\n📝 TRANSCRIPT:\n');
                            console.log(lecture.transcript);
                            console.log('\n' + '='.repeat(80) + '\n');
                        }
                    }
                }
            }
        }

        if (!foundTranscript) {
            console.log('❌ No transcripts found in database.');
            console.log('💡 Make sure you clicked "Transcribe" on a lecture first!');
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

viewTranscript();
