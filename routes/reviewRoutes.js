const express = require('express');
const router = express.Router({ mergeParams: true });
const {Station} = require('../models/station');
const {Review} = require('../models/review');
const {ValidateReview, validateAdmin, validateLogin, wrapAsync, reqBodyImageFilter} = require('../utils/Validation');
const { Administrator } = require('../models/admin');
const { User } = require('../models/user');
const {cloudinary} = require('../utils/cloudinary');
const {upload} = require('../index.js');


//=================================
// #3.8: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
router.get('/:id', validateLogin, validateAdmin, wrapAsync(async (req, res) => {
    const {id} = req.params;

    let review = await Review.findByIdAndDelete(id);

    res.redirect(`/station/${review.station[0]}` || originalUrl || '/');

}));
//=================================
// #3.5: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
router.put('/:edit/:id', validateLogin, upload.array('images'), ValidateReview, wrapAsync(async (req, res) => {

    const originalUrl = req.session.originalUrl || '/';
    const {id} = req.params;
    const review = await Review.findById(id);
    // console.log (review);
    for (let image of review.images)
      await cloudinary.uploader.destroy(image.filename);

    reqBodyImageFilter(req);
    await Review.findByIdAndUpdate(id, req.body);
    res.redirect(`/station/${review.station[0]}` || originalUrl);
}));
//=================================
// #3.5: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
router.put('/:id', validateLogin, upload.array('images'), ValidateReview, wrapAsync(async (req, res) => {

    const {id} = req.params;
    const currentStation = await Station.findById(id);

    reqBodyImageFilter(req);

    const newReview = await new Review(req.body);
    await newReview.save();
    const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
    currentUser.reviews.push(newReview);

    if (currentUser.admin){
        await Administrator.findByIdAndUpdate(currentUser.id, currentUser);
    } else {
        await User.findByIdAndUpdate(currentUser.id, currentUser);
    }
    currentStation.reviews.push(newReview);
    await Station.findByIdAndUpdate(id, currentStation);

    res.redirect(`/station/${id}`);
}));
//=================================
// #3: Adds a review to the targeted Station
//=================================
router.get('/new/:id', validateLogin, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const station = await Station.findById(id);

    res.render('review', {station});
}));
module.exports = router;
