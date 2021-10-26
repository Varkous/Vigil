if (process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require('express');
const router = express.Router({ mergeParams: true });
const {upload} = require('../index');
const {User} = require('../models/user');
const {Review} = require('../models/review');
const {Administrator} = require('../models/admin');
const bcrypt = require('bcrypt');
const {ValidateProfile, wrapAsync} = require('../utils/Validation');
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(Administrator.authenticate()));
passport.serializeUser(Administrator.serializeUser());
passport.deserializeUser(Administrator.deserializeUser());

async function storeProfileImages(req) {
  let i = 0;
  req.body.profilePic = {};
  req.body.background = {};
  for (let image of req.files){
    let filename = image.filename;
    let url = image.path;
    if(i === 0) req.body.profilePic = {filename, url};

    if (i === 1) req.body.background = {filename, url};

    i++;
  }
  return req;
}
//=================================
// #4: Create a new profile
//=================================
router.post('/login', wrapAsync(async (req, res, next) => {

    let originalUrl = req.session.originalUrl || '/';
    const {username, password} = req.body;
    const validUser = await User.findOne({username: username});

    if (!validUser || !validUser.username) {
      req.flash('error', 'Username or password incorrect');
      return res.redirect('/login');
    };

    const validPassword = await bcrypt.compare(password, validUser.password);

    if (validPassword) {
        req.session._id = validUser.id;
        req.login(validUser, err => {
          if(err) return next(err);
          req.session._id = validUser.id;
        });
        if (originalUrl.includes('DELETE')) return res.redirect('/')
        else res.redirect(originalUrl);
    } else {
      req.flash('error', 'Username or password incorrect');
      res.redirect('/login');
    }
}));
//=================================
// #4: Create a new profile
//=================================
router.post('/admin', passport.authenticate('local', {failureFlash: true, failureRedirect: '/admin'}), wrapAsync(async (req, res, next) => {
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
        res.redirect('/admin');
    }

    res.redirect(originalUrl);
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/admin', wrapAsync(async (req, res, next) => {

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
    })
  } catch (e) {
      req.flash('error', e.message);
      return res.redirect('/register/new');
  }

    res.redirect(`/users/${newUser.id}`);
}));
//=================================
// #4.5: Post Profile to Database
//=================================
router.post('/register', upload.any(), ValidateProfile, wrapAsync(async (req, res, next) => {
    req.body.stations = [];
    await storeProfileImages(req);

    const newUser = await new User(req.body);
    await newUser.save();
    req.session._id = newUser.id;

    res.redirect(`/users/${newUser.id}`);
}));
//=================================
// #4.5: Post Profile to Database
//=================================
router.post('/register/:id', upload.any(), ValidateProfile, wrapAsync(async (req, res, next) => {
    const {id} = req.params;
    await storeProfileImages(req);
    if (req.body.profilePic)
      await cloudinary.uploader.destroy(res.locals.User.profilePic.filename);
    if (req.body.background)
      await cloudinary.uploader.destroy(res.locals.User.background.filename);

    const editUser = await User.findByIdAndUpdate(id, req.body)
    || await Administrator.findByIdAndUpdate(id, req.body);

    res.redirect(`/users/${newUser.id}`);
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/register', wrapAsync(async (req, res, next) => {
    res.render('register', {editUser: false});
}));
//=================================
// #4: Create a new profile
//=================================
router.delete('/users/:id', wrapAsync(async (req, res, next) =>{

    const {id} = req.params;
    if (req.session._id === id) {
      await User.findByIdAndDelete(id);
      req.flash('warning', `User ${targetedUser.username} removed`);
    } else {
      req.flash('error', "Cannot delete another user's profile");
      return res.redirect(`/users/${id}`);
    }
    res.redirect('/');
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/users/:id', wrapAsync(async (req, res, next) =>{
    const {id} = req.params;
    const selectedUser =
    await User.findById(id).populate('articles').populate('title') ||
    await Administrator.findById(id).populate('articles').populate('title');

    if(!selectedUser){
        req.flash('error', 'That user could not be found');
        return res.redirect('/');
    }

    res.render('user', {selectedUser});
}));
//=================================
// #4: Create a new profile
//=================================
router.get('/users/:id/posts', wrapAsync(async (req, res, next) =>{
    const {id} = req.params;
    const selectedUser =
    await User.findById(id).populate('stations').populate({path: 'reviews', populate: {path: 'station'}}).populate('articles') ||
    await Administrator.findById(id).populate('stations').populate({path: 'reviews', populate: {path: 'station'}}).populate('articles');

    if (!selectedUser) {
      req.flash('error', 'That user could not be found');
      return res.redirect('/');
    }
    if (!selectedUser.stations) {
      console.log (selectedUser);
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
      return res.redirect('/');
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

}));

module.exports = router;
