const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');


const schematic = mongoose.Schema({
    email:{
    type: String,
    required: true,
    unique: true,
},
admin: {
    type: Boolean,
},
profilePic: {
    url: String,
    filename: String,
},
background: {
    url: String,
    filename: String,
},
articles: [{type: mongoose.Schema.Types.ObjectID, ref: "Article"}],
reviews: [{type: mongoose.Schema.Types.ObjectID, ref: "Review"}],
stations: [{type: mongoose.Schema.Types.ObjectID, ref: "Station"}],
})

// Whenever a User is deleted from the database/collection, scan the associated properties of "articles" and "reviews", and remove them from the corresponding collections by matching the IDs.
schematic.post('findOneAndDelete', deleteReferences)

schematic.plugin(passportLocalMongoose);
module.exports.Administrator = mongoose.model('Administrator', schematic);

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
