const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');
const { awardXP, updateStreak } = require('./gamificationController');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const { username, email, password, role, code } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate Role and Code
        let userRole = 'student';
        if (role === 'teacher') {
            if (code !== 'TEACHER123') {
                return res.status(403).json({ message: 'Invalid Teacher Access Code' });
            }
            userRole = 'teacher';
        } else if (role === 'admin') {
            // Prevent public admin registration (or require a super secret code)
            return res.status(403).json({ message: 'Admin registration is restricted' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: userRole,
            profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

        if (user) {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Set Refresh Token in HTTP-only cookie
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                accessToken
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Set Refresh Token in HTTP-only cookie
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // Award daily login XP and update streak for students
            let gamification = null;
            if (user.role === 'student') {
                const streakResult = await updateStreak(user._id);
                const xpResult = await awardXP(user._id, 10, 'Daily Login');
                gamification = { streakResult, xpResult };
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                accessToken,
                gamification
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (Refreshes using cookie)
const refresh = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const accessToken = generateAccessToken(user);

        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            upiId: user.upiId,
            bio: user.bio,
            expertise: user.expertise
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            user.upiId = req.body.upiId || user.upiId;
            user.bio = req.body.bio || user.bio;
            user.expertise = req.body.expertise || user.expertise;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                upiId: updatedUser.upiId,
                accessToken: generateAccessToken(updatedUser)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    refresh,
    getProfile,
    updateProfile
};
