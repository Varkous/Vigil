const mongoose = require('mongoose');
const BaseJoi = require('joi');
const {escapeHTML} = require('../utils/info-prov');
const Joi = BaseJoi.extend(escapeHTML);

photoSchema = new mongoose.Schema ({
    url: String,
    filename: String,
    explanation: String,
});
linkSchema = new mongoose.Schema ({
    url: String,
    headnote: String,
});

photoSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const schematic = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    titlePic: {
      url: String,
      filename: String,
      explanation: String,
    },
    user: [{type: mongoose.Schema.Types.ObjectID, ref: "User"}],
    admin: [{type: mongoose.Schema.Types.ObjectID, ref: "Administrator"}],
    photos: [photoSchema],
    links: [{
      url: String,
      headnote: String,
    }],
    // links: [linkSchema],
    date: String,
    explanation: [String],
    reference: [{type: mongoose.Schema.Types.ObjectID, ref: "Station"}],
    designations: [String],
});

schematic.post('findOneAndDelete', deleteReferences);
schematic.post('findOneAndRemove', deleteReferences);

module.exports.Article = new mongoose.model('Article', schematic);
process.modelNames.push('Article');

module.exports.UserArticle = Joi.object({
    title: Joi.string().min(10).max(60).required(),
    content: Joi.string().required().min(300),
    titlePic: Joi.object().required(),
    links: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    user: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    admin: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    photos: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    date: Joi.string(),
    explanation: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    reference: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    designations: Joi.array(),
})

const {cloudinary} = require('../utils/cloudinary');
const {User} = require('./user');
const {Administrator} = require('./admin');

async function deleteReferences (doc) {
  if (doc) {
    cloudinary.api.delete_resources(doc.photos.map(p => p.filename));

    const givenUser = await User.findOne({_id: {$in: doc.user}}) || await Administrator.findOne({_id: {$in: doc.admin}});

    if (givenUser) {
      await givenUser.articles.splice(givenUser.articles.indexOf(doc.id));

      if (givenUser.admin === true) await Administrator.findByIdAndUpdate(givenUser.id, givenUser);
      else await User.findByIdAndUpdate(givenUser.id, givenUser);
    }
  }
};
