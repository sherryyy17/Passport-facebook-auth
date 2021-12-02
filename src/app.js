const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { UserModel } = require("../src/user/fbModel");
var path = require('path');

var passport = require("passport"),
  FacebookStrategy = require("passport-facebook").Strategy;

const app = express();
const port = 3000;

app.set("trust proxy", 1);
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

//passport setup
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/");
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: '1376851059438296',
      clientSecret: 'f1da1e2ed432d7bda351a1a9673b2de9',
      callbackURL: "http://localhost:3000/auth/facebook/secrets",
      profileFields: [
        "id",
        "displayName",
        "picture.width(200).height(200)",
        "first_name",
        "middle_name",
        "last_name",
        "gender",
        "link",
        "email",
        "location",
        "friends",
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile.emails[0].value);
      try {
        const users = await UserModel.findOne({
          facebookId: profile.id,
        });
        if (users) {
          return done(null, users);
        }
        const email = profile.emails[0].value;
        const photo = profile.photos[0].value;
        console.log("Line 74", photo);
        const { id: facebookId, displayName: name } = profile;
        const user = await UserModel.create({ email, facebookId, name ,photo});
        await user.save();
        console.log(user);
        done(false, user);
      } catch (err) {
        console.log(err);
        done(err, false, err.message);
      }
    }
  )
);
app.set("view engine", "ejs");
app.set('views',path.join(__dirname,'app_views'));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile", isLoggedIn, (req, res) => {
  console.log("Line 50", req.user);
  res.render("profile", { user: req.user });
});

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile,email,user_friends"],
  })
);

app.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  })
);

mongoose.connect("mongodb://localhost:27017/testsdb", {
  useNewUrlParser: "true",
});

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);