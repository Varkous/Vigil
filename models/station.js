const mongoose = require('mongoose');
const BaseJoi = require('joi');
const {escapeHTML} = require('../utils/info-prov');
const {Article} = require('./article');
const Joi = BaseJoi.extend(escapeHTML);

const opts = { toJSON: { virtuals: true } };
const schematic = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Gotta call it something.']
  },
  geometry: {
    location:{
        type:[String],
        required: true,
    },
    type:{
        type: String,
        enum:['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: [true, 'Must be a location, fool.']
    }
  },
  zipcode: {
    type: Number,
    required: true,
  },
  owner: {
    name: String,
    id: String,
  },
  images: [{
    url: String,
    filename: String,
  }],
  description: {
    type: String,
    required: true,
  },
  warnings: [String],
  industry: [String],
  affiliates: [String],
  article_refs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
  reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}]
}, opts);

/* Virtual is basically a "phonecall function" that our doesn't officially recognize as a property, and uses it only to capture properties (in this case, the description) and create a new temporary "fake" value (shortening description to 50 characters), and adding it as a secret data type to the model under the object "properties"*/
// --------------------------------------------------------
schematic.virtual('properties.markerText').get( function() {

  let status = {
    color: 'darkgray',
    type: 'New'
  }
  if (this.article_refs && this.article_refs
  .filter( a => a.designations && a.designations.includes('Contention')).length / this.article_refs.length * 100 > 33) status = {
    color: 'orange',
    type: 'Contested'
  }
  else if (this.reviews.length + this.article_refs.length > 2) status = {
    color: 'darkgreen',
    type: 'Reviewed'
  }
  return `<a href="station/${this._id}">${this.name}</a>
    <p class="text-dark">${this.description.substring(0, 50)}...</p>
    <h6 style="color: ${status.color}; font-family: 'Raleway';"><span class="text-dark">Status:</span> ${status.type}</h6>`
});

schematic.post('findOneAndDelete', stationDeletion);

module.exports.Station = new mongoose.model('Station', schematic);
process.modelNames.push('Station');

module.exports.UserStation = Joi.object({
  name: Joi.string().min(3).max(30).required().escapeHTML(),
  geometry: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  zipcode: Joi.number().integer().precision(5),
  images: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  owner: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
  description: Joi.string().required().min(30).max(1500),
  warnings: Joi.array(),
  industry: Joi.array(),
  affiliates: Joi.array(),
  article_refs: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
});


const { Review } = require('./review');
const { User } = require('./user');
const { Administrator } = require('./admin');
const { cloudinary } = require('../utils/cloudinary');

async function stationDeletion(doc) {

  if (doc) {
    try {
      if (doc.images[0]) cloudinary.api.delete_resources(doc.images.map(i => i.filename));

      /*Before anything else, we remove the Station from the owner (an Adminstrator's) database*/
      let givenUser = await Administrator.findOne({_id: doc.owner._id}) || await User.findOne({_id: doc.owner._id});
      if (givenUser) {
        givenUser.stations.splice(givenUser.stations.indexOf(doc._id), 1);
        await Administrator.findByIdAndUpdate(givenUser._id, givenUser) || await User.findByIdAndUpdate(givenUser._id, givenUser);
      }
      /*Loops through each review of the Station being deleted, and locates the User who made the given review
      through ID retrieval, and deletes the review from their profile database via "splice", in addition to deleting it from
      the Station itself at the end (which happens AFTER the loop. 'Turned out to be important)*/
      for (let id of doc.reviews) {
        let reviewOf = await Review.findById(id);
        let givenUser = reviewOf ? await User.findById(reviewOf.user) || await Administrator.findById(reviewOf.admin) : false;

        if (givenUser) {
          await givenUser.reviews.splice(givenUser.reviews.indexOf(id));
          if (givenUser.admin === true) await Administrator.findByIdAndUpdate(givenUser._id, givenUser);
          else await User.findByIdAndUpdate(givenUser._id, givenUser);
        }
        await Review.findByIdAndDelete(id);
      };
    } catch (e) {
      console.log(e)
    }
  }
};
