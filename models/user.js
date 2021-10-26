const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const BaseJoi = require('joi');
const {escapeHTML} = require('../utils/info-prov');
const Joi = BaseJoi.extend(escapeHTML);

// bcrypt.genSalt(12).then( async (salt) => {
//   console.log(await bcrypt.hash('Echelon1', salt))
// });


const schematic = new mongoose.Schema({
    username:{
      type: String,
      required: [true, 'Gotta call you something'],
    },
    password: {
      type: String,
      required: [true, 'Password missing or not adequate'],
    },
    profilePic:{
      url: String,
      filename: String,
    },
    email: {
      type: String,
      required: [true, 'Need valid email'],
    },
    region: {
      type: String,
      required: [true, 'Tell me where you live!'],
    },
    zipcode: Number,
    articles: [{type: mongoose.Schema.Types.ObjectID, ref: "Article"}],
    reviews: [{type: mongoose.Schema.Types.ObjectID, ref: "Review"}],
    background: {
      url: String,
      filename: String,
    },
    summary: String,
})

// Whenever a User is deleted from the database/collection, scan the associated properties of "articles" and "reviews", and remove them from the corresponding collections by matching the IDs.
schematic.post('findOneAndDelete', deleteReferences);

// Before any User is saved, return without changes if no alterations have been maved from previous info. Normally though, take the password, generate Salt and hash it before storing to database.
schematic.pre('save', async function (next){
  if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// Joi associates itself with our Model/Schematic: Attaching verification methods to the User properties (making sure it's an object, string, array, appropriate length, etc.)
module.exports.User = new mongoose.model('User', schematic);
module.exports.UserProfile = Joi.object({
  username: Joi.string().min(4).max(16).required(),
  password: Joi.string().min(6).max(20).required(),
  profilePic: Joi.string(),
  email: Joi.string().required(),
  region:Joi.string().required(),
  zipcode:Joi.number().min(4).max(6).required(),
  reviews: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  background: Joi.object(),
  summary: Joi.string().min(0).max(1500),
})


const {Review} = require('./review');
const {Article} = require('./article');
const {cloudinary} = require('../utils/cloudinary');

async function fetchArticleOrReviewIds(documentData) {
  const ids = [];
  for (let id of documentData)ids.push(id);

  return ids;
};

async function deleteReferences (doc) {
  if (doc) {
      const reviewsToPurge = await fetchArticleOrReviewIds(doc.reviews);
      if (reviewsToPurge) {
        for (let review of reviewsToPurge){
          await Review.findOneAndDelete({_id: review});
        }
      }
      const articlesToPurge = await fetchArticleOrReviewIds(doc.articles);
      if (articlesToPurge) {
        for(let article of articlesToPurge){
          await Article.findOneAndDelete({_id: article});
        }
      }
      await cloudinary.uploader.destroy(doc.profilePic[0].filename);
      await cloudinary.uploader.destroy(doc.background[0].filename);

  }
}
