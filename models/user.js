const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const BaseJoi = require('joi');
const {escapeHTML} = require('../utils/info-prov');
const Joi = BaseJoi.extend(escapeHTML);
const passportLocalMongoose = require('passport-local-mongoose');

const schematic = new mongoose.Schema({
    username:{
      type: String,
      required: [true, 'Gotta call you something'],
    },
    profilePic:{
      url: String,
      filename: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
      required: [true, 'Tell me where you live!'],
    },
    zipcode: Number,
    articles: [{type: mongoose.Schema.Types.ObjectID, ref: "Article"}],
    reviews: [{type: mongoose.Schema.Types.ObjectID, ref: "Review"}],
    stations: [{type: mongoose.Schema.Types.ObjectID, ref: "Station"}],
    background: {
      url: String,
      filename: String,
    },
    bio: String,
})

// Whenever a User is deleted from the database/collection, scan the associated properties of "articles" and "reviews", and remove them from the corresponding collections by matching the IDs.
schematic.post('findOneAndDelete', deleteReferences);
schematic.post('findOneAndRemove', deleteReferences);
schematic.plugin(passportLocalMongoose);
// Before any User is saved, return without changes if no alterations have been maved from previous info. Normally though, take the password, generate Salt and hash it before storing to database.
// schematic.pre('save', async function (next){
//   if (!this.isModified('password')) return next();
//
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });


// Joi associates itself with our Model/Schematic: Attaching verification methods to the User properties (making sure it's an object, string, array, appropriate length, etc.)
module.exports.User = new mongoose.model('User', schematic);
process.modelNames.push('User');

module.exports.UserProfile = Joi.object({
  username: Joi.string().min(4).max(16).required(),
  password: Joi.string().min(6).max(20).required(),
  profilePic: Joi.string(),
  email: Joi.string().required(),
  region: Joi.string().required(),
  zipcode: Joi.number().required(),
  reviews: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  articles: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  stations: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  background: Joi.object(),
  bio: Joi.string().max(1500),
})


const {Review} = require('./review');
const {Article} = require('./article');
const {Station} = require('./station');
const {cloudinary} = require('../utils/cloudinary');

async function fetchCreations(documentData) {
  const doc_ids = [];
  for (let id of documentData) doc_ids.push(id);

  return doc_ids;
};

async function deleteReferences (doc) {
  if (doc) {
    try {
      fetchCreations(doc.stations).then( stations => stations
        .map( async (s) => await Station.findOneAndDelete({_id: s})));

      fetchCreations(doc.reviews).then( reviews => reviews
        .map( async (r) => await Review.findOneAndDelete({_id: r})));

      fetchCreations(doc.articles).then( articles => articles
        .map( async (a) => await Article.findOneAndDelete({_id: a})));

    } catch (e) {
      console.log (e);
      return next(e);
    } finally {
      if (doc.profilePic && doc.profilePic.filename)
        await cloudinary.uploader.destroy(doc.profilePic.filename);

      if (doc.background && doc.background.filename)
        await cloudinary.uploader.destroy(doc.background.filename);
    };
  }
};
