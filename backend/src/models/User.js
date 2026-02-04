const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () { return !this.provider; } // Password required only if local auth
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  provider: {
    type: String, // 'local', 'google', 'github'
    default: 'local'
  },
  googleId: String,
  githubId: String,

  // Teacher specific fields
  bio: String,
  expertise: [String],
  upiId: {
    type: String,
    trim: true
  },
  earnings: {
    type: Number,
    default: 0
  },
  preloaderText: {
    type: String,
    default: ''
  },
  preloaderImage: {
    type: String,
    default: ''
  },

  // Student specific fields
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    purchaseDate: Date,
    completedLectures: [String],
    isCompleted: {
      type: Boolean,
      default: false
    },
    completionDate: Date
  }],
  watchHistory: [{
    videoId: String,
    timestamp: Date
  }],

  // Gamification fields
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  lastStreakDate: Date,
  achievements: [{
    achievementId: String,
    title: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    xpAwarded: Number
  }],
  badges: [{
    badgeId: String,
    name: String,
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to hash password
// Pre-save hook to hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
