const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // If user exists but no googleId (e.g. registered with email), update it
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.provider = 'google';
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    provider: 'google',
                    profilePicture: profile.photos[0].value,
                    role: 'student' // Default role
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    if (!user.githubId) {
                        user.githubId = profile.id;
                        user.provider = 'github';
                        await user.save();
                    }
                    return done(null, user);
                }

                user = await User.create({
                    username: profile.username || profile.displayName,
                    email: profile.emails[0].value,
                    githubId: profile.id,
                    provider: 'github',
                    profilePicture: profile.photos[0].value,
                    role: 'student'
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

module.exports = passport;
