const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcryptjs');


const schematic = mongoose.Schema({
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
  summary: String,
  admin: {
      type: Boolean,
  },
})

// Whenever a User is deleted from the database/collection, scan the associated properties of "articles" and "reviews", and remove them from the corresponding collections by matching the IDs.
schematic.post('findOneAndDelete', deleteReferences)
// schematic.plugin(passportLocalMongoose);
schematic.pre('save', async function (next){
  if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports.Administrator = mongoose.model('Administrator', schematic);
process.modelNames.push('Administrator');

const {Review} = require('./review');
const {Article} = require('./article');
const {cloudinary} = require('../utils/cloudinary');

async function deleteReferences (doc){
    if (doc){

        async function fetchArticleOrReviewIds(documentData){
            const ids = [];
            for (let id of documentData){
                ids.push(id);
            }
            return ids;
        };

        if(doc.reviews){
            const reviewsToPurge = await fetchArticleOrReviewIds(doc.reviews);
            if(reviewsToPurge){
                for(let review of reviewsToPurge){
                    await Review.findOneAndDelete({_id: review});
                }
            }
        }

        if(doc.articles){
            const articlesToPurge = await fetchArticleOrReviewIds(doc.articles);
            if(articlesToPurge){
                for(let article of articlesToPurge){
                    await Article.findOneAndDelete({_id: article});
                }
            }
        }

        await cloudinary.uploader.destroy(doc.profilePic.filename);
        await cloudinary.uploader.destroy(doc.background.filename);
    }
}
