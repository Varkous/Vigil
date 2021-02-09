const mongoose = require('mongoose');
const Joi = require('joi');
const {cloudinary} = require('../cloudinary');
const {Schema} = mongoose;

imageSchema = new Schema ({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const schematic = Schema({
    statement: String,
    content: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    images: [imageSchema],
    user: [{type: mongoose.Schema.Types.ObjectID, ref: "User"}],
    admin: [{type: mongoose.Schema.Types.ObjectID, ref: "Administrator"}],
    station: [{type: mongoose.Schema.Types.ObjectID, ref: "Station"}],
})

schematic.post('findOneAndRemove', deleteReferences);
schematic.post('findOneAndDelete', deleteReferences);

module.exports.Review = mongoose.model('Review', schematic);
module.exports.UserReview = Joi.object({
    statement: Joi.string(),
    content: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
    user: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    admin: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
    station: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string()),
})


const { User } = require('./user');
const { Administrator } = require('./admin');
const { Station } = require('./station');

async function deleteReferences (doc){

/*"doc" is the Review being deleted, it's an object. We can scan it to see if there's a User (OR) Admin ID within. If so, 
we find the User with that ID, and remove the coinciding Review from their database. The if-else is verifying if it's a User or Administrator. 
Subsequently, we find every Image uploaded with the review, and delete it from the Cloudinary database it is referencing.*/    
try {
    if (doc){
        console.log("Review deleted");
        for(let image of doc.images){
            await cloudinary.uploader.destroy(image.filename);
        }

        const givenUser = await User.findOne({_id: {$in: doc.user}}) || await Administrator.findOne({_id: {$in: doc.user}});
        givenUser.reviews.splice(givenUser.reviews.indexOf(doc._id));

        if (givenUser.admin === true){
            await Administrator.findByIdAndUpdate(givenUser.id, givenUser);
        } else {
        await User.findByIdAndUpdate(givenUser.id, givenUser);
        }



        const stationToAdjust = await Station.findById(doc.station[0]) || "Why the fuck not???";
        
        if(stationToAdjust){
            stationToAdjust.reviews.splice(doc._id);
            await Station.findByIdAndUpdate(stationToAdjust.id, stationToAdjust);
        }

    }
} catch (error){return error;}

}


