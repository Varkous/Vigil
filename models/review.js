const mongoose = require('mongoose');
const BaseJoi = require('joi');
const {escapeHTML} = require('../utils/info-prov');
const Joi = BaseJoi.extend(escapeHTML);
const {cloudinary} = require('../utils/cloudinary');
const {Schema} = mongoose;

imageSchema = new Schema ({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const schematic = Schema({
  summary: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  date: String,
  images: [imageSchema],
  user: [{type: mongoose.Schema.Types.ObjectID, ref: "User"}],
  admin: [{type: mongoose.Schema.Types.ObjectID, ref: "Administrator"}],
  station: [{type: mongoose.Schema.Types.ObjectID, ref: "Station"}],
})

schematic.post('findOneAndRemove', deleteReferences);
schematic.post('findOneAndDelete', deleteReferences);

module.exports.Review = mongoose.model('Review', schematic);
process.modelNames.push('Review');

module.exports.UserReview = Joi.object({
  summary: Joi.string().required().min(4).max(50),
  content: Joi.string().required().min(10).max(700),
  rating: Joi.number().required().min(1).max(5),
  date: Joi.string(),
  user: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  admin: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  station: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
})


const { User } = require('./user');
const { Administrator } = require('./admin');
const { Station } = require('./station');

async function deleteReferences (doc) {

/*"doc" is the Review being deleted, it's an object. We can scan it to see if there's a User (OR) Admin ID within. If so,
we find the User with that ID, and remove the coinciding Review from their database. The if-else is verifying if it's a User or Administrator.
Subsequently, we find every Image uploaded with the review, and delete it from the Cloudinary database it is referencing.*/
try {
  if (doc) {

    for (let image of doc.images)
      await cloudinary.uploader.destroy(image.filename);

    const givenUser = await User.findOne({_id: {$in: doc.user}}) || await Administrator.findOne({_id: {$in: doc.user}});

    if (givenUser) {
      givenUser.reviews.splice(givenUser.reviews.indexOf(doc._id));
      await User.findByIdAndUpdate(givenUser._id, givenUser);

      if (givenUser.admin === true) {
        await Administrator.findByIdAndUpdate(givenUser._id, givenUser);
      } else {
      await User.findByIdAndUpdate(givenUser._id, givenUser);
      }
    }

    const stationToAdjust = await Station.findById(doc.station[0]) || "Why the fuck not???";

    if (stationToAdjust) {
      stationToAdjust.reviews ? stationToAdjust.reviews.splice(doc._id) : false;
      await Station.findByIdAndUpdate(stationToAdjust._id, stationToAdjust);
    }

  }
} catch (e) {
  console.log (e)
  return e;
}

}
