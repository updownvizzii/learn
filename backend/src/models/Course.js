const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    video: {
        type: String,
        // required: true // Make optional for now as we might not have video upload yet
    },
    duration: {
        type: String,
        default: '10:00' // Placeholder
    },
    id: String // For frontend key matching if needed, though _id exists
});

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    lectures: [lectureSchema],
    id: String
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Cloud', 'Other']
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'Beginner'
    },
    language: {
        type: String,
        default: 'English'
    },
    isFree: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    thumbnail: {
        type: String,
        default: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80' // Default placeholder
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sections: [sectionSchema],
    learningObjectives: [String],
    requirements: [String],
    targetAudience: [String],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Published'], // 'Published' and 'Active' consistent
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
