// Login route
const express = require("express");
const router = express.Router();
const cookieParser = require('cookie-parser');
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
const cookieSession = require('cookie-session');

router.use(express.json());

const userDb = require("../models/userModel");


// cookieSession config
router.use(cookieSession({
    maxAge:  5*60 * 1000, // One day in milliseconds
    keys: ['sandhyaaaaaaaa'],
}));

router.use(passport.initialize()); // Used to initialize passport
router.use(passport.session()); // Used to persist login sessions

// Strategy config
passport.use(new GoogleStrategy({
        clientID: '571063685637-vgrphb2lc7banjroqs10tvhgd4342e4j.apps.googleusercontent.com',
        clientSecret: 'hRQPR2osopsm4pJ_HUZRn4FC',
        callbackURL: 'http://52.36.63.204:3000/login/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
    console.log( accessToken);
        //done(null, profile); // passes the profile data to serializeUser
         userDb.findOne({googleId:profile.id})
            .then((user) => {
                if(user){
                    console.log("User found in the database");
                    done(null, user);
                }
                else{
                    let newUser ={displayName:profile.displayName, image:profile.photos[0].value, google:{},googleId : profile.id,
                        googleToken : accessToken, role:"user"};

                    userDb.insert(newUser)
                        .then(newUser => console.log("user added"));

                    done(null, newUser);
                }
            })
            .catch(err => console.log(err));
    }
));

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware to check if the user is authenticated
function  isUserAuthenticated(req, res, next) {
    //console.log("hhhhhhh",req.user);
    //console.log("lll",req.session.passport.user);
    if (req.user) {
        next();
    } else {
        res.json({message:'You must login!',success:false});
    }
}

// Routes
router.get('/', (req, res) => {
    res.send('index');
});
// Add headers

// passport.authenticate middleware is used here to authenticate the request
router.get('/auth/google' , function(req, res, next) {

        const { returnTo } = req.query;
        console.log("lllllllllll", returnTo);
        const state = returnTo
            ? Buffer.from(JSON.stringify({ returnTo })).toString('base64') : undefined
        const authenticator = passport.authenticate('google', {

            scope: ['profile'] ,
            state// Used to specify the required data
        })
        authenticator(req, res, next)


        // req.session.browserURL = req.query.id;
        // next();
    },

);

// The middleware receives the data from Google and runs the function on Strategy config
router.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    try {
        const { state } = req.query;
        const { returnTo } = JSON.parse(Buffer.from(state, 'base64').toString())
        console.log("return to", returnTo);
        if (typeof returnTo === 'string') {
            console.log("inside if ------------->>>>>>>>");
            return res.redirect(`http://34.211.0.250:3000${returnTo}`)
        }
    } catch {
        // just redirect normally below
    }
    res.cookie("user", req.session.passport.user);
    res.redirect('http://34.211.0.250:3000/')


    //res.redirect('http://localhost:3001/');

});

// Secret route
router.get('/secret', isUserAuthenticated, (req, res) => {
    //console.log("response------------>",req.originalUrl);
    //console.log(req.cookies.user);
    res.json({User:JSON.stringify(req.session.passport.user),success:true});
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('http://34.211.0.250:3000/');
});



module.exports = {router:router,
isUserAuthenticated:isUserAuthenticated}
;
//module.exports = isUserAuthenticated;