String.prototype.isNotIn = function () {

  for (let comparison of arguments) {
    if (Array.isArray(comparison)) {
      for (let c of comparison) {
        if (c.includes(this)) return false;
      }
    } else if (comparison.includes(this)) return false;
  };
  return true;
};

const express = require('express');
const {Station, UserStation} = require('../models/station');
const {User, UserProfile} = require('../models/user');
const { UserArticle } = require('../models/article');
const { UserReview } = require('../models/review');
const { Administrator } = require('../models/admin');
const { documentExists } = require('./info-prov');
const { cloudinary } = require('../utils/cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1Ijoic2FybGl0ZSIsImEiOiJja2t4cHoxaDUyaWJpMnhueTB3bHBrdXRxIn0.GB70eyL6CmZ14SVdwS9nfw';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const AppError = require('./AppError');
const flash = require('connect-flash');

//Returns and stores any errors caught by middleware that this function is "wrapped" around (basically all route handlers)
module.exports.wrapAsync = function (fn){
  return function (req, res, next){
    fn(req, res, next).catch(e => next(e));
  }
}
/*Uses the Joi schema to compare and validate the properties of the req.body object,
and verify if the types (integers, arrays, etc.) and names are correct via passing
it through "joi" object*/
module.exports.validateProfile = async (req, res, next) => {
    await documentExists(req, [Administrator, User], {name: req.body.username});
    const {error} = await UserProfile.validate(req.body);

    if (error) {
      const message = error.details.map(err => err.message).join(',');
      req.flash('error', message);

      if (req.files)
        cloudinary.api.delete_resources(req.files.map(i => i.filename));

      return res.redirect('/register');
    } else next(error);
}

//Same as above but for Station submissions
module.exports.validateStation = async (req, res, next) => {

    try {
      await documentExists(req, Station, {name: req.body.name});
    } catch (e) {
      return next(e);
    };

    let arrays = ['warnings', 'industry', 'affiliates'];
    for (let array of arrays) {
      if (req.body[array]) {
        req.body[array] = typeof(req.body[array]) === 'string' ? req.body[array].split() : req.body[array];
      } // To make sure all three of these inputs are arrays before validation check
    };
    const {error} = await UserStation.validate(req.body);

    if (error) {
      const message = error.details.map(err => err.message).join(',');
      req.flash('error', message);
      if (req.files)
        cloudinary.api.delete_resources(req.files.map(i => i.filename));
      return res.redirect(req.session.prev || req.originalUrl);
    } else {
      const geoData = await geocoder.forwardGeocode({
        query: `${req.body.geometry.location}`,
        limit: 2,
      }).send();

      try {
        req.body.geometry.type = geoData.body.features[0].geometry.type;
        req.body.geometry.coordinates = geoData.body.features[0].geometry.coordinates;
        next();
      } catch (e) {
        cloudinary.api.delete_resources(req.files.map(i => i.filename));
        return next(new Error('Invalid location, geodata could be retrieved'));
      };
    }
}

//Same as above but for Article submissions
module.exports.validateArticle = async (req, res, next) => {

  req.body.photos = [];
  req.body.links = [];
  req.body.date = new Date().toLocaleString();
  let form = req.body;

  if (req.files) {
    for (let i = 0; i < req.files.length; i++) {
      let url = req.files[i].path;
      let filename = req.files[i].filename;
      let explanation;
      if (req.body.explanation) {
        explanation = req.body.explanation[i];
      }
      form.photos.push({url, filename, explanation});
      form.titlePic = form.photos[0];
    }
  }
  if (form.urls) {
    for (let i = 0; i < form.urls.length; i++) {
      form.links.push({url: form.urls[i], headnote: form.headnotes[i]});
    }
  }
  delete(form.urls);
  delete(form.headnotes);
  req.body = form;
  const {error} = await UserArticle.validate(req.body);

  if (error) {
    const message = error.details.map(err => err.message).join(',');
    req.flash('error', message);
    if (req.files)
      cloudinary.api.delete_resources(req.files.map(i => i.filename));
    return res.redirect('/article/new');
  } else next(error);
}

//Same as above but for Review submission
module.exports.validateReview = async (req, res, next) => {
    const currentUser = await User.findById(req.session._id) || await Administrator.findById(req.session._id);
    req.body.user = currentUser.id;
    req.body.rating = parseInt(req.body.rating);

    const {error} = await UserReview.validate(req.body);

    if (error) {
      const message = error.details.map(err => err.message).join(',');
      req.flash('error', message);
      if (req.files)
        cloudinary.api.delete_resources(req.files.map(i => i.filename));
      return res.redirect(req.session.prev || '/main');
    } else next(error);

}

module.exports.validateLogin = async (req, res, next) =>{
  if (req.isAuthenticated()) {
    req.session.canDelete = true;
    next();
  } else {
    req.flash('warning', 'Login required for access');
    req.session.originalUrl = req.originalUrl;
    return res.redirect('/login');
  }
}
module.exports.validateAdmin = async (req, res, next) =>{
    if (req.session.canDelete === true && req.originalUrl.includes('DELETE')){
      return next();
    }
    if (!req.isAuthenticated()) {
      req.flash('error', 'Administration privledges required');
      req.session.originalUrl = req.originalUrl;
      return res.redirect('/admin');
    }
    next();
}

// Used by Auto-Station-Creation (Seed Database tab button/function below this one) to ensure shareholders/restrictions have no duplicate entries by user.
// module.exports.consistency = function (array) {
//   /*Verifies if array is actually an array/object.*/
//   if (typeof(array) === 'object') {
//     /*Essentially removes duplicate entries by checking the next index with the current one*/
//     array = array.filter( (element, i, array) => {
//       for (let nextIndex = i + 1; nextIndex <= array.length + 1; nextIndex++) {
//         if (array[nextIndex] === element) array.splice(nextIndex, 1);
//       }
//       return array[i];
//     });
//   }
//   return array;
// }

//----------------------------------------------------------------------------------------
module.exports.reqBodyImageFilter = (req) => {
  req.body.images = [];
  if (req.files) {
    for (let image of req.files) {
      let url = image.path;
      let filename = image.filename;
      req.body.images.push({url, filename});
    }
  }
  return req;
}
