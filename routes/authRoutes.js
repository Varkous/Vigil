if (process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require('express');
const router = express.Router({ mergeParams: true });
const {upload} = require('../index');
const {User} = require('../models/user');
const {Review} = require('../models/review');
const {Administrator} = require('../models/admin');
const {validateProfile, validateLogin, wrapAsync} = require('../utils/Validation');
const {cloudinary} = require('../utils/cloudinary');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

async function storeProfileImages(req) {
  let i = 0;
  req.body.profilePic = {};
  req.body.background = {};
  for (let image of req.files){
    let filename = image.filename;
    let url = image.path;

    if (i === 0) req.body.profilePic = {filename, url};
    if (i === 1) req.body.background = {filename, url};

    i++;
  }
  return req;
}
//=================================
<<<<<<< HEAD
// #4: Create a new profile
//=================================
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), wrapAsync(async (req, res, next) => {

    let originalUrl = req.session.prev || req.originalUrl || '/';
    if (req.user) {
        req.session._id = req.user.id;
        req.login(req.user, err => {
          if(err) return next(err);
          req.session._id = req.user.id;
        });
      return res.redirect('/');
    } else {
      req.flash('error', 'Username or password incorrect');
      res.redirect('/login');
    }
}));
//=================================
// #4: Create a new profile
//=================================
router.post('/admin', wrapAsync(async (req, res, next) => {
    const originalUrl = req.session.originalUrl || '/';

    const {username} = req.body;
    const validUser = await Administrator.findOne({username});
    if (!validUser || !validUser.username) {
      req.flash('error', 'Username or password incorrect');
      return res.redirect('/admin');
    };
    if (validUser) {
      req.login(validUser, err => {
        if(err) {return next(err)};
        req.session._id = validUser.id;
        req.flash('success', 'Logged in as an Administrator');
      });
    } else {
      req.flash('error', 'Username or password incorrect');
      return res.redirect('/admin');
    }

    res.redirect(originalUrl);
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/admin', wrapAsync(async (req, res, next) => {
    // req.body.username = 'Shield';
    // req.body.password = 'Shield1';
    // req.body.email = 'whocares@what.com';


    res.render('admin');
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/login', wrapAsync(async (req, res, next) => {

    res.render('login');
}));
//=================================
// #4.5: Post Profile to Database
=======
// #1: Form page for creating new user account
//=================================
router.get('/register', wrapAsync(async (req, res, next) => {
    res.render('register', {editUser: {admin: false}});
}));
//=================================
// #2: Form page for creating new admin account, editUser is 'admin' for front-end reference
//=================================
router.get('/register/admin', wrapAsync(async (req, res, next) => {
    res.render('register', {editUser: {admin: true}});
}));
//=================================
// #3: Post request from form that creates a User, "User.register" and "req.login" are methods created by Passport library for authentication
//=================================
router.post('/register', upload.any(), validateProfile, wrapAsync(async (req, res, next) => {
    req.body.stations = [];
    const {username, password} = req.body;
    await storeProfileImages(req);

    const newUser = await new User(req.body);
    const user = await User.register(newUser, password);
    await user.save();
    req.session._id = user.id;

    req.login(user, err => {
      if (err) return next(err);
      req.session._id = user.id;
      req.flash('success', 'Registered and logged in successfully');
    });

    res.redirect(`/users/${user.id}`);
}));
//=================================
// #4: Post request from form that creates a new Administrator, "Administrator.register" and "req.login" are methods created by Passport library for authentication
>>>>>>> vigil-1.3
//=================================
router.post('/register/admin', upload.array('images'), wrapAsync(async (req, res, next) => {
    const originalUrl = req.session.originalUrl || '/';
    req.body.admin = true;
    await storeProfileImages(req);

    const {password} = req.body;
  try {
    const admin = await new Administrator(req.body);
    const newAdmin = await Administrator.register(admin, password);

    req.login(newAdmin, err => {
      if(err) {return next(err)};
      req.session._id = newAdmin.id;
      req.flash('success', 'Logged in as an Administrator');
      res.redirect(originalUrl);
    });
  } catch (e) {
    req.flash('error', e.message);
<<<<<<< HEAD
    return res.redirect('/register');
=======
    return res.redirect('/register/admin');
>>>>>>> vigil-1.3
  }
    res.redirect(`/users/${newUser.id}`);
}));
//=================================
<<<<<<< HEAD
// #4.5: Post Profile to Database
//=================================
router.post('/register', upload.any(), validateProfile, wrapAsync(async (req, res, next) => {
    req.body.stations = [];
    const {username, password} = req.body;
    await storeProfileImages(req);

    const newUser = await new User(req.body);
    const user = await User.register(newUser, password);
    await user.save();
    req.session._id = user.id;

    req.login(user, err => {
      if (err) return next(err);
      req.session._id = user.id;
      req.flash('success', 'Registered and logged in successfully');
    });

    res.redirect(`/users/${user.id}`);
}));
//=================================
// #4.5: Post Profile to Database
=======
// #5: Go to login page
//=================================
router.get('/login', wrapAsync(async (req, res, next) => {

    res.render('login');
}));
//=================================
// #6: Post request from login page, authenticates user via Passport module
//=================================
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), wrapAsync(async (req, res, next) => {

    let originalUrl = req.session.prev || req.originalUrl || '/';
    if (req.user) {
        req.session._id = req.user.id;
        req.login(req.user, err => {
          if(err) return next(err);
          req.session._id = req.user.id;
        });
      return res.redirect('/');
    } else {
      req.flash('error', 'Username or password incorrect');
      return res.redirect('/login');
    }
}));
//=================================
// #7: Same as above except authenticate administrator
//=================================
router.post('/admin', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), wrapAsync(async (req, res, next) => {
    const originalUrl = req.session.originalUrl || '/';

    const {username} = req.body;
    const validUser = await Administrator.findOne({username});

    if (validUser && validUser.username) {
      req.login(validUser, err => {
        if(err) {return next(err)};
        req.session._id = validUser.id;
        req.flash('success', 'Logged in as an Administrator');
      });
    } else {
      req.flash('error', 'Username or password incorrect');
      return res.redirect('/login');
    }

    res.redirect(originalUrl);
}));
//=================================
// #8 Logs user out through passport (on request object)
//=================================
router.get('/signout', wrapAsync(async (req, res, next) => {
    req.session.canDelete = true;
    req.session._id = null;
    req.logout();
    return res.redirect('/login');
}));
//=================================
// #9: Provides update to User document using registration form
>>>>>>> vigil-1.3
//=================================
router.post('/register/:id', upload.any(), validateProfile, wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    await storeProfileImages(req);

    if (req.body.profilePic)
      cloudinary.uploader.destroy(res.locals.User.profilePic.filename);
    if (req.body.background)
      cloudinary.uploader.destroy(res.locals.User.background.filename);

    const editUser = await User.findByIdAndUpdate(id, req.body)
    || await Administrator.findByIdAndUpdate(id, req.body);

    res.redirect(`/users/${editUser.id}`);
}));
//=================================
<<<<<<< HEAD
// #4: Create a new profile
//=================================
router.get('/register', wrapAsync(async (req, res, next) => {
    res.render('register', {editUser: false});
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/register/admin', wrapAsync(async (req, res, next) => {
    res.render('register', {editUser: 'admin'});
}));
//=================================
// #4: Create a new profile
=======
// #10: Sends deletion request to remove User document
>>>>>>> vigil-1.3
//=================================
router.delete('/users/:id', wrapAsync(async (req, res, next) =>{

    const {id} = req.params;
    if (req.session._id === id) {
      await User.findByIdAndDelete(id);
<<<<<<< HEAD
      req.flash('warning', `User ${targetedUser.username} removed`);
=======
      req.flash('warning', `User profile removed, and all your creations deleted`);
>>>>>>> vigil-1.3
    } else {
      req.flash('error', "Cannot delete another user's profile");
      return res.redirect(`/users/${id}`);
    }
    res.redirect('/main');
}));
//=================================
<<<<<<< HEAD
// #4: Create a new profile
//=================================
router.get('/users/:id', wrapAsync(async (req, res, next) =>{
    const {id} = req.params;
    const selectedUser =
    await User.findById(id).populate('articles').populate('title') ||
    await Administrator.findById(id).populate('articles').populate('title');

    if(!selectedUser){
      req.flash('error', 'That user could not be found');
=======
// #11: Viewing personal page of a user's profile
//=================================
router.get('/users/:id', wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const selectedUser = await User.findById(id) || await Administrator.findById(id);

    if (!selectedUser) {
      req.flash('warning', 'That user could not be found');
>>>>>>> vigil-1.3
      return res.redirect('/main');
    }

    res.render('user', {selectedUser});
}));
//=================================
<<<<<<< HEAD
// #4: Create a new profile
//=================================
router.get('/users/:id/posts', wrapAsync(async (req, res, next) =>{
    const {id} = req.params;
    const selectedUser =
    await User.findById(id).populate('stations').populate({path: 'reviews', populate: {path: 'station'}}).populate('articles') ||
    await Administrator.findById(id).populate('stations').populate({path: 'reviews', populate: {path: 'station'}}).populate('articles');

    if (!selectedUser) {
      req.flash('error', 'That user could not be found');
      return res.redirect('/main');
    }
    if (!selectedUser.stations) {
      selectedUser.stations = [];
    }

    res.render('posts', {selectedUser});
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/edit/user/:id', wrapAsync(async (req, res, next) =>{
    const {id} = req.params;
    let edit;
    if (req.session._id !== id) {
      req.flash('error', "Cannot edit another user's profile");
      return res.redirect(`/users/${id}`);
    }
    const editUser = await User.findById(id) || await Administrator.findById(id);

    if (!editUser) {
      req.flash('error', 'That user could not be found');
      return res.redirect('/main');
    } else editUser.password = '';


    res.render('register', {editUser});
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/signout', wrapAsync(async (req, res, next) => {
    req.session.canDelete = true;
    let user = await User.findById(req.session._id);
    if (user && user.username){
      req.session._id = null;
      return res.redirect('/login');
    }
    else {
      req.session._id = null;
      req.logout();
      return res.redirect('/admin');
    }
    next();

=======
// #12: Viewing personal page of a user's profile
//=================================
router.get('/users/edit/:id', wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    const editUser = await User.findById(id) || await Administrator.findById(id);

    if (!editUser) {
      req.flash('warning', 'That user could not be found');
      return res.redirect('/main');
    }

    res.render('register', {editUser});
}));
//=================================
// #13: View extension of a user's profile by visiing Posts view via their profile
//=================================
router.get('/users/posts/:id', wrapAsync(async (req, res, next) =>{
    const {id} = req.params;
    const selectedUser =
    await User.findById(id).populate('stations').populate({path: 'reviews', populate: {path: 'station'}}).populate('articles') ||
    await Administrator.findById(id).populate('stations').populate({path: 'reviews', populate: {path: 'station'}}).populate('articles');

    if (!selectedUser) {
      req.flash('warning', 'That user could not be found');
      return res.redirect('/main');
    }
    if (!selectedUser.stations) {
      selectedUser.stations = [];
    }

    res.render('posts', {selectedUser});
>>>>>>> vigil-1.3
}));

module.exports = router;
