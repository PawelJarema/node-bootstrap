const   passport            = require('passport'),
        GoogleStrategy      = require('passport-google-oauth20').Strategy,
        FacebookStrategy    = require('passport-facebook').Strategy,
        mongoose            = require('mongoose'),
        { ObjectId }        = mongoose.Types,
        User                = mongoose.model('user');

const keys = require('../config/keys');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    User
        .findById(id)
        .then(user => {
            done(null, user);
        });
});
     
passport.use(new GoogleStrategy({
    clientID: keys.googleClientId,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
},
async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ auth: { googleId: profile.id }});
    let email = typeof profile.emails[0] === 'object' ? profile.emails[0].value : null;
    let hasAccount = profile._json.isPlusUser;
    let link = null;
    
    if (hasAccount) {
        link = 'https://plus.google.com/u/0/' + profile.id; 
    }
    
    if (!user && email) {
        user = await User.findOne({ 'contact.email': email });
    }
    
    if (user) {
        done(null, user);
    } else {
        let newUser = new User({
            joindate: new Date().getTime(),
            auth: { googleId: profile.id },
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            contact: { email: email },
            security: { password: null, verified: true },
            agreements: { rodo: true }
        });
        
        await newUser.save();
        
        done(null, newUser);
    }
}));

passport.use(new FacebookStrategy({
    clientID: keys.facebookAppId,
    clientSecret: keys.facebookAppSecret,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name'],
    proxy: true
},
async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ auth: { facebookId: profile.id } });
    let email = typeof profile.emails[0] === 'object' ? profile.emails[0].value : null;
    let link = 'https://www.facebook.com/profile.php?id=' + profile.id;
    
    if (!user && email) {
        user = await User.findOne({ 'contact.email': email });    
    }
    
    if (user) {
        done(null, user);
    } else {
        let newUser = new User({
            joindate: new Date().getTime(),
            auth: { facebookId: profile.id },
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            contact: { email: email },
            security: { password: null, verified: true },
            agreements: { rodo: true }
        });
        
        await newUser.save();
        
        done(null, newUser);
    }
}));