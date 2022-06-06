const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
// const User = require('../models/UserModel');
const AccountsModel = require('../models/AccountsModel');
const router = express.Router();


/*  Google AUTH  */
// var userProfile;
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    const googleId = profile.id;
    // console.log(profile);
    //check domain-mail ở đây???
    let providerData = profile._json;
    if (providerData.hd === "student.tdtu.edu.vn" || providerData.hd === "tdtu.edu.vn") {
      // find or create user in database, etc
      AccountsModel.findOne({ 'googleId': googleId })
        .then(user => {
          if (user) return done(null, user); //nếu user exist
          // image: (providerData.picture) ? providerData.picture : undefined
          //ngược lại tạo user mới`
          new AccountsModel({
            googleId: googleId,
            email: profile.emails[0].value,
            name: profile.name.familyName + ' ' + profile.name.givenName,
            image: (providerData.picture) ? providerData.picture : 'uploads/avatar/avatar_image.png',
            role: 2,
          }).save()
            .then(user => done(null, user))
            .catch(err => done(err, null));
        })
        .catch(err => {
          if (err) return done(err, null);
        });
    } else {
      // fail        
      done(new Error("Tên miền phải là @student.tdtu.edu.vn hoặc @tdtu.edu.vn"));
    }



  }
));

// hd: "tdtu.edu.vn", prompt: 'select_account',
router.get('/',
  passport.authenticate('google', {scope: ['profile', 'email'] }));

router.get('/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/user/login'
  })
);

//lưu user vào session.passport.user
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  AccountsModel.findById(id)
    .then(user => done(null, user)) //user object attaches to the request as req.user 
    .catch(err => done(err, null));
});



module.exports = router;
