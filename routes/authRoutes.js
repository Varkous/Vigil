// if (process.env.NODE_ENV !== "production"){
//     require('dotenv').config();
// }

const express = require('express');
const router = express.Router({ mergeParams: true });
//const {cloudinary} = require('../cloudinary');
const {storage} = require('../cloudinary');
const multer = require('multer');
const upload = multer({storage});
const {User} = require('../models/user');
const {Administrator} = require('../models/admin');
const bcrypt = require('bcrypt');
const {ValidateProfile, codeword, wrapAsync} = require('../Validation');
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(Administrator.authenticate()));
passport.serializeUser(Administrator.serializeUser());
passport.deserializeUser(Administrator.deserializeUser());

const success = (data) => console.log("Success.", data);
const failure = (error) => console.log("Success.", error);

//=================================
// #4: Create a new profile
//=================================
router.post('/login', wrapAsync(async (req, res, next) => {

    let originalUrl = req.session.originalUrl || '/';
    const {username, password} = req.body;
    const validUser = await User.findOne({username: username});

    if (!validUser || !validUser.username){
    req.flash('error', 'Username or password incorrect');
    return res.redirect('/login');
    };

    const validPassword = await bcrypt.compare(password, validUser.password);
    
    if(validPassword){
        req.session._id = validUser.id;
        if (originalUrl.includes('DELETE')){
            return res.redirect('/')
        } else {
        res.redirect(originalUrl);
        }
    } else {
        req.flash('error', 'Username or password incorrect');
        res.redirect('/login');
    }
}))
//=================================
// #4: Create a new profile
//=================================
router.post('/admin', passport.authenticate('local', {failureFlash: true, failureRedirect: '/admin'}), wrapAsync(async (req, res, next) => {
    const originalUrl = req.session.originalUrl || '/';
    
    const {username} = req.body;
    const validAdmin = await Administrator.findOne({username});
    if(validAdmin){
        req.login(validAdmin, err => {
            if(err) {return next(err)};
            req.session._id = validAdmin.id;
            req.flash('success', 'Logged in as an Administrator');
        })
    }

    res.redirect(originalUrl);
}))
//=================================
// #4: Create a new profile
//=================================
router.get('/admin', wrapAsync(async (req, res, next) => {

    res.render('admin');
}))
//=================================
// #4: Create a new profile
//=================================
router.get('/login', wrapAsync(async (req, res, next) => {

    res.render('login');
}))

async function storeProfileImages(req){
    let i = 0;
    req.body.profilePic = {};
    req.body.background = {};
    for (let image of req.files){
        let filename = image.filename;
        let url = image.path;
        if(i === 0){
            req.body.profilePic = {filename, url};
        }
        if(i === 1){
            req.body.background = {filename, url};
        }
        i++
    }
    return req;
}

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

    res.redirect(originalUrl);
}))
//=================================
// #4.5: Post Profile to Database
//=================================
router.post('/register', upload.array('images'), ValidateProfile, wrapAsync(async (req, res, next) => {

    await storeProfileImages(req);

    const newUser = await new User(req.body);
    await newUser.save();
    req.session._id = newUser.id;

    res.redirect('/');
}))
//=================================
// #4: Create a new profile
//=================================
router.get('/register/admin', codeword, wrapAsync(async (req, res, next) => {
    let adminDisplay;
    if(req.approved){
        adminDisplay = true;
    } else {adminDisplay = false}

    res.render('register', {adminDisplay});
}))
//=================================
// #4: Create a new profile
//=================================
router.get('/register/user', wrapAsync(async (req, res, next) => {
    let adminDisplay = false;
    res.render('register', {adminDisplay});
}))
//=================================
// #4: Create a new profile
//=================================
router.delete('/users/:id', wrapAsync(async (req, res, next) =>{

    const {id} = req.params;

    await User.findByIdAndDelete(id) || await Administrator.findByIdAndDelete(id);
    req.flash('warning', 'Account removed');

    res.redirect('/');
}))
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
}))
//=================================
// #4: Create a new profile
//=================================
router.get('/signout', wrapAsync(async (req, res, next) => {
    req.session.canDelete = true;
    let user = await User.findById(req.session._id);
    if(user && user.username){
        req.session._id = null;    
        return res.redirect('/login');
    } 
    else {
        req.session._id = null;  
        req.logout();
        return res.redirect('/admin');
    }
    next();

}))

module.exports = router;
