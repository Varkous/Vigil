const express = require('express');
const router = express.Router({ mergeParams: true });
const {Station} = require('../models/station');
const {Review} = require('../models/review');
const {validateReview, validateAdmin, validateLogin, wrapAsync, reqBodyImageFilter} = require('../utils/Validation');
const { Administrator } = require('../models/admin');
const { User } = require('../models/user');
const {cloudinary} = require('../utils/cloudinary');
const {upload} = require('../index.js');


//=================================
<<<<<<< HEAD
// #3.8: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
//=================================
router.delete('/:id', validateLogin, wrapAsync(async (req, res) => {
  const {id} = req.params;
  console.log ('happened', id);
=======
// #1: Finds review and deletes it.
//=================================
router.delete('/:id', validateLogin, wrapAsync(async (req, res) => {
  const {id} = req.params;

>>>>>>> vigil-1.3
  await Review.findOne({_id: id}, async (err, review) => {
    if (err) {
      req.flash('error', err.message);
      return next(err);
    } else if (review) {
      await Review.findOneAndDelete({_id: id});
      req.flash('success', 'Review removed');
      return res.redirect(`/station/${review.station[0]}`);
    } else {
      req.flash('error', 'Review not found')
      return res.redirect(`/station/${review.station[0]}`);
    }
  });
}));
//=================================
<<<<<<< HEAD
// #3.5: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
=======
// #2: Edit station by ID and removing previous images.
>>>>>>> vigil-1.3
//=================================
router.put('/:edit/:id', validateLogin, upload.array('images'), validateReview, wrapAsync(async (req, res) => {

    const {id} = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.redirect(req.session.originalUrl || '/');
    }
    for (let image of review.images)
      await cloudinary.uploader.destroy(image.filename);

    reqBodyImageFilter(req);
    await Review.findByIdAndUpdate(id, req.body);
    res.redirect(`/station/${review.station[0]}` || req.session.originalUrl || '/');
}));
//=================================
<<<<<<< HEAD
// #3.5: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
=======
// #3: Adds a review to the targeted station, linked to the User who's currently logged in by ID.
>>>>>>> vigil-1.3
//=================================
router.post('/:id', validateLogin, upload.array('images'), validateReview, wrapAsync(async (req, res, next) => {
  try {
    const {id} = req.params;
    const currentStation = await Station.findById(id);

    reqBodyImageFilter(req);

    const newReview = await new Review(req.body);
    await newReview.save();
    const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
    currentUser.reviews.push(newReview);

    if (currentUser.admin) await Administrator.findByIdAndUpdate(currentUser.id, currentUser);
    else await User.findByIdAndUpdate(currentUser.id, currentUser);

    currentStation.reviews.push(newReview);
    await Station.findByIdAndUpdate(id, currentStation);

    res.redirect(`/station/${id}`);
  } catch (e) {
    console.log (e)
  }
}));
//=================================
<<<<<<< HEAD
// #3: Adds a review to the targeted Station
=======
// #4: Form page for posting a new review
>>>>>>> vigil-1.3
//=================================
router.get('/new/:id', validateLogin, wrapAsync(async (req, res) => {
    const {id} = req.params;
    const station = await Station.findById(id);

    res.render('review', {station});
}));
module.exports = router;
