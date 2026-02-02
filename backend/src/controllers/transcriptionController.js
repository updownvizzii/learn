const Course = require('../models/Course');
const { transcribeVideo, formatTranscriptWithTimestamps } = require('../services/transcriptionService');

/**
 * Transcribe a specific lecture video
 * POST /api/courses/:courseId/lectures/:lectureId/transcribe
 */
exports.transcribeLecture = async (req, res) => {
    try {
        console.log('=== Transcription Request Started ===');
        console.log('User:', req.user ? req.user.id : 'NOT AUTHENTICATED');
        console.log('Course ID:', req.params.courseId);
        console.log('Lecture ID:', req.params.lectureId);

        const { courseId, lectureId } = req.params;

        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            console.log('❌ Course not found');
            return res.status(404).json({ message: 'Course not found' });
        }
        console.log('✅ Course found:', course.title);

        // Check if user is the instructor
        if (course.instructor.toString() !== req.user.id) {
            console.log('❌ User is not the instructor');
            return res.status(403).json({ message: 'Not authorized to transcribe lectures for this course' });
        }
        console.log('✅ User is authorized');

        // Find the lecture
        let lecture = null;
        let sectionIndex = -1;
        let lectureIndex = -1;

        for (let i = 0; i < course.sections.length; i++) {
            const section = course.sections[i];
            for (let j = 0; j < section.lectures.length; j++) {
                if (section.lectures[j]._id.toString() === lectureId) {
                    lecture = section.lectures[j];
                    sectionIndex = i;
                    lectureIndex = j;
                    break;
                }
            }
            if (lecture) break;
        }

        if (!lecture) {
            console.log('❌ Lecture not found');
            return res.status(404).json({ message: 'Lecture not found' });
        }
        console.log('✅ Lecture found:', lecture.title);

        if (!lecture.video) {
            console.log('❌ No video found for lecture');
            return res.status(400).json({ message: 'No video found for this lecture' });
        }
        console.log('✅ Video URL:', lecture.video);

        // Update status to processing
        course.sections[sectionIndex].lectures[lectureIndex].transcriptionStatus = 'processing';
        await course.save();
        console.log('✅ Status updated to processing');

        // Start transcription (this could be moved to a background job for production)
        try {
            console.log('🎬 Starting Groq Whisper transcription...');
            const transcriptionResult = await transcribeVideo(lecture.video);
            console.log('✅ Groq transcription completed successfully');

            // Format transcript with timestamps
            const formattedTranscript = formatTranscriptWithTimestamps(transcriptionResult.segments);

            // Update lecture with transcript
            course.sections[sectionIndex].lectures[lectureIndex].transcript = transcriptionResult.text;
            course.sections[sectionIndex].lectures[lectureIndex].transcriptionStatus = 'completed';
            await course.save();
            console.log('✅ Transcript saved to database');

            res.json({
                success: true,
                message: 'Transcription completed successfully',
                transcript: transcriptionResult.text,
                formattedTranscript: formattedTranscript,
                segments: transcriptionResult.segments,
                duration: transcriptionResult.duration,
                language: transcriptionResult.language
            });

        } catch (transcriptionError) {
            console.error('❌ Groq transcription error:', transcriptionError.message);
            console.error('Error details:', transcriptionError);

            // Update status to failed
            course.sections[sectionIndex].lectures[lectureIndex].transcriptionStatus = 'failed';
            await course.save();

            throw transcriptionError;
        }

    } catch (error) {
        console.error('❌ Transcription controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to transcribe lecture'
        });
    }
};

/**
 * Get transcript for a lecture
 * GET /api/courses/:courseId/lectures/:lectureId/transcript
 */
exports.getLectureTranscript = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the lecture
        let lecture = null;
        for (const section of course.sections) {
            const found = section.lectures.find(l => l._id.toString() === lectureId);
            if (found) {
                lecture = found;
                break;
            }
        }

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        res.json({
            success: true,
            transcript: lecture.transcript || '',
            status: lecture.transcriptionStatus,
            hasTranscript: !!lecture.transcript
        });

    } catch (error) {
        console.error('Get transcript error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transcript'
        });
    }
};

/**
 * Batch transcribe all lectures in a course
 * POST /api/courses/:courseId/transcribe-all
 */
exports.transcribeAllLectures = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is the instructor
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const results = {
            total: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            skipped: 0
        };

        // Count total lectures with videos
        for (const section of course.sections) {
            for (const lecture of section.lectures) {
                if (lecture.video) {
                    results.total++;
                }
            }
        }

        // Start processing (in production, use a job queue)
        res.json({
            success: true,
            message: `Started transcription for ${results.total} lectures`,
            info: 'Transcriptions will be processed in the background. Check individual lecture status for updates.'
        });

        // Process transcriptions asynchronously
        processTranscriptions(course);

    } catch (error) {
        console.error('Batch transcription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start batch transcription'
        });
    }
};

// Helper function to process transcriptions in background
async function processTranscriptions(course) {
    for (let i = 0; i < course.sections.length; i++) {
        for (let j = 0; j < course.sections[i].lectures.length; j++) {
            const lecture = course.sections[i].lectures[j];

            if (!lecture.video || lecture.transcriptionStatus === 'completed') {
                continue;
            }

            try {
                course.sections[i].lectures[j].transcriptionStatus = 'processing';
                await course.save();

                const transcriptionResult = await transcribeVideo(lecture.video);

                course.sections[i].lectures[j].transcript = transcriptionResult.text;
                course.sections[i].lectures[j].transcriptionStatus = 'completed';
                await course.save();

                console.log(`Transcription completed for lecture: ${lecture.title}`);

            } catch (error) {
                console.error(`Transcription failed for lecture: ${lecture.title}`, error);
                course.sections[i].lectures[j].transcriptionStatus = 'failed';
                await course.save();
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

module.exports = exports;
